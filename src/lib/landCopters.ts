import {getLandingTransformation} from "./anchors"
import { ShapeType } from "./ShapeType";

function parseWhitelistOrBlackList(text){
    if(!text) text = ''
    return text.replace(/\r?\n|\r/g, ' ').replace(/ +/g,' ').trim().split(' ').map(l => l.split('_'))
}

export function landCopters(fragments) {
    // TODO: tags need to be attached to layers
    // avoid using fake ids inside layer
    let allAnchors = fragments
        .filter((f) => !f.hidden)
        .filter((x) => x)
        .flatMap((f) => f.layers.map(l=>{l.fID = f.id; return l}))
        .flatMap((l) =>
            l.anchors?.map((a) => {
                a.order = l.order;
                a.layerOutline = l.outline;
                a.tags = l.tags;
                a.fID = l.fID;
                return a;
            })
        )
        .filter((x) => x);

    let copterPoints = allAnchors.filter(
        (a) => a.type == ShapeType.Point2D && a.padOrCopter == "Helicopter"
    );
    let copterPolygons = allAnchors.filter(
        (a) =>
            a.type == ShapeType.Polygon4P && a.padOrCopter == "Helicopter"
    );
    let padPoints = allAnchors.filter(
        (a) => a.type == ShapeType.Point2D && a.padOrCopter == "Helipad"
    );
    let padPolygons = allAnchors.filter(
        (a) => a.type == ShapeType.Polygon4P && a.padOrCopter == "Helipad"
    );
    let landingParams = [];



    function anchorsToCopterGroups() {
        let groups = copterPolygons.map((copterPoly) => {
            return {
                tags: copterPoly.tags,
                fID: copterPoly.fID,
                layerOutline: copterPoly.layerOutline,
                pad: undefined,
                padPoint: undefined,
                copter: copterPoly,
                copterPoint: copterPoints.find(
                    (copterPoint) =>
                        copterPoint.layerOutline == copterPoly.layerOutline
                ),
            };
        });

        copterPoints = copterPoints.filter(
            (copterPoint) =>
                !groups.some(
                    (g) =>
                        g.copterPoint?.layerOutline ==
                        copterPoint.layerOutline
                )
        );
        groups = [
            ...groups,
            ...copterPoints
                .map((copterPoint) => {
                    return {
                        tags: copterPoint.tags,
                        fID: copterPoint.fID,
                        layerOutline: copterPoint.layerOutline,
                        pad: undefined,
                        padPoint: undefined,
                        copter: undefined,
                        copterPoint: copterPoint,
                    };
                })
                .filter((x) => x),
        ];
        return groups;
    }

    let copterGroups  = anchorsToCopterGroups();

    function addLandingToGroup(copterGroup) {
        function isWider(a, b) {
            const aw =
                Math.max(a.r1_p1_x, a.r1_p2_x, a.r1_p3_x, a.r1_p4_x) -
                Math.min(a.r1_p1_x, a.r1_p2_x, a.r1_p3_x, a.r1_p4_x);
            const bw =
                Math.max(b.r1_p1_x, b.r1_p2_x, b.r1_p3_x, b.r1_p4_x) -
                Math.min(b.r1_p1_x, b.r1_p2_x, b.r1_p3_x, b.r1_p4_x);
            return aw < bw ? 1 : -1;
        }

        const padCandidates = padPolygons.filter((pad) =>
            copterTagsMatchWhiteAndBlacklist(copterGroup, pad)
        );
        const padPointsCandidates = padPoints.filter((pad) =>
            copterTagsMatchWhiteAndBlacklist(copterGroup, pad)
        );
        const minPadOrder = Math.min(...padCandidates.map((p) => p.order));
        const minPointOrder = Math.min(
            ...padPointsCandidates.map((p) => p.order)
        );
        const maxPadOrder = Math.max(...padCandidates.map((p) => p.order));
        const maxPadPointOrder = Math.max(
            ...padPointsCandidates.map((p) => p.order)
        );

        if (copterGroup.copter?.isBack || copterGroup.copterPoint?.isBack) {
            if (minPadOrder < minPointOrder) {
                // add min pad and mb find a padPoint
                copterGroup.pad = padCandidates.find(
                    (c) => c.order == minPadOrder
                );
                copterGroup.padPoint = padPointsCandidates.find(
                    (c) =>
                        c.order == minPadOrder &&
                        copterGroup.pad?.layerOutline == c.layerOutline
                );
            } else {
                // add min padPoint and mb find a pad
                copterGroup.padPoint = padPointsCandidates.find(
                    (c) => c.order == minPointOrder
                );
                copterGroup.pad = padCandidates.find(
                    (c) =>
                        c.order == minPointOrder &&
                        copterGroup.padPoint?.layerOutline == c.layerOutline
                );
            }
        } else if (
            copterGroup.copter?.isOnWidest ||
            copterGroup.copterPoint?.isOnWidest
        ) {
            copterGroup.pad = padCandidates.sort(isWider)[0];
            copterGroup.padPoint = padPointsCandidates.find(
                (c) => copterGroup.pad.layerOutline == c.layerOutline
            );
        } else {
            if (maxPadOrder > maxPadPointOrder) {
                // add min pad and mb find a padPoint
                copterGroup.pad = padCandidates.find(
                    (c) => c.order == maxPadOrder
                );
                copterGroup.padPoint = padPointsCandidates.find(
                    (c) =>
                        c.order == maxPadPointOrder &&
                        copterGroup.pad?.layerOutline == c.layerOutline
                );
            } else {
                // add min padPoint and mb find a pad
                copterGroup.padPoint = padPointsCandidates.find(
                    (c) => c.order == maxPadPointOrder
                );
                copterGroup.pad = padCandidates.find(
                    (c) =>
                        c.order == maxPadPointOrder &&
                        copterGroup.padPoint?.layerOutline == c.layerOutline
                );
            }
        }
        if (!copterGroup.pad && !copterGroup.padPoint) {
            return null;
        } else {
            return copterGroup;
        }
    }

    copterGroups = copterGroups.map(addLandingToGroup).filter((x) => x);

    landingParams = copterGroups;

    landingParams.forEach((cp) => {
        landCopterForLayerByOutline(
            fragments,
            cp.fID,
            cp.layerOutline,
            cp.copter,
            cp.pad,
            cp.copterPoint,
            cp.padPoint
        );
    });

    function translateChildToParent(childLayerOutline, parentLayerOutline) {
        const child = fragments
            .flatMap((f) => f.layers)
            .find((l) => l.outline == childLayerOutline);
        const parent = fragments
            .flatMap((f) => f.layers)
            .find((l) => l.outline == parentLayerOutline);

        const padPolygons = parent.anchors.filter((a) => a.type == ShapeType.Polygon4P && a.padOrCopter == "Helipad")
        
        const pad = padPolygons.find((pad) =>
            copterTagsMatchWhiteAndBlacklist({tags:child.tags}, pad)
        );

        const padPoints = parent.anchors.filter((a) => a.type == ShapeType.Point2D && a.padOrCopter == "Helipad")
        
        const point = padPoints.find((point) =>
            copterTagsMatchWhiteAndBlacklist({tags:child.tags}, point)
        );

        let padTarget = null
        let pointTarget = null
        
        if (pad)
        {
            padTarget = {
                r1_p1_x: (pad.r1_p1_x*parent.copterScale+parent.copterOffsetX), 
                r1_p2_x: (pad.r1_p2_x*parent.copterScale+parent.copterOffsetX), 
                r1_p3_x: (pad.r1_p3_x*parent.copterScale+parent.copterOffsetX), 
                r1_p4_x: (pad.r1_p4_x*parent.copterScale+parent.copterOffsetX), 
                r1_p1_y: (pad.r1_p1_y*parent.copterScale+parent.copterOffsetY), 
                r1_p2_y: (pad.r1_p2_y*parent.copterScale+parent.copterOffsetY), 
                r1_p3_y: (pad.r1_p3_y*parent.copterScale+parent.copterOffsetY), 
                r1_p4_y: (pad.r1_p4_y*parent.copterScale+parent.copterOffsetY), 
            }
        }

        if (point)
        {
            pointTarget = {
                p1_x: (point.p1_x*parent.copterScale+parent.copterOffsetX), 
                p1_y: (point.p1_y*parent.copterScale+ parent.copterOffsetY), 
            }
        }




        const copterPad =child.anchors.find((a) => a.type == ShapeType.Polygon4P && a.padOrCopter == "Helicopter")
        const copterPoint =child.anchors.find((a) => a.type == ShapeType.Point2D && a.padOrCopter == "Helicopter")
        const t=getLandingTransformation(
            copterPad,
            padTarget,
            copterPoint,
            pointTarget,
        )
        
    //(a) => a.type == ShapeType.Point2D && a.padOrCopter == "Helicopter"
    //(a) => a.type == ShapeType.Polygon4P && a.padOrCopter == "Helicopter"
    //(a) => a.type == ShapeType.Point2D && a.padOrCopter == "Helipad"
    //(a) => a.type == ShapeType.Polygon4P && a.padOrCopter == "Helipad"    
        child.copterScale = t.scale;
        child.copterOffsetX = t.offsetX;
        child.copterOffsetY = t.offsetY;

        //child.copterScale = child.copterScale * parent.copterScale;
        //child.copterOffsetX = child.copterOffsetX + parent.copterOffsetX;
        //child.copterOffsetY = child.copterOffsetY + parent.copterOffsetY;
    }

    //transitive landing
    function getLandingPath(l, landingParams) {
        landingParams = JSON.parse(
            JSON.stringify(
                landingParams.filter(
                    (x) => x.layerOutline != l.layerOutline
                )
            )
        );
        let outline = l.layerOutline;
        let padLayerOutline = l.pad
            ? l.pad.layerOutline
            : l.padPoint.layerOutline;
        let parent = landingParams.find(
            (f) => f.layerOutline == padLayerOutline
        );
        if (parent) {
            translateChildToParent(outline, parent.layerOutline);
        }
    }

    landingParams.forEach((p) => getLandingPath(p, landingParams));
    return fragments;
}

function landCopterForLayerByOutline(
    fragments,
    fID,
    outline,
    copter,
    pad,
    copterPoint,
    padPoint
) {
    const landTransform = getLandingTransformation(
        copter,
        pad,
        copterPoint,
        padPoint
    );
    const f = fragments.find((f) => f.id == fID);
    const layer = f?.layers.find((l) => l.outline == outline);
    if (layer) {
        layer.copterScale = landTransform.scale;
        layer.copterOffsetX = landTransform.offsetX;
        layer.copterOffsetY = landTransform.offsetY;
    }
}


export function layerHasLandCandidates(layer, fragments) {
    const candidates = fragments
        .filter((f) => !f.hidden)
        .filter((x) => x)
        .flatMap((f) => f.layers)
        .flatMap((l) =>
            l.anchors?.map((a) => {
                a.order = l.order;
                a.layerOutline = l.outline;
                a.tags = l.tags;
                a.fID = l.fID;
                return a;
            })
        )
        .filter((x) => x)
        .filter((x) => x.padOrCopter == "Helipad")
        .filter((pad) => copterTagsMatchWhiteAndBlacklist(layer, pad));

    return candidates.length > 0;
}

function copterTagsMatchWhiteAndBlacklist(copter, pad) {
    return (
        layerMatchesWhitelist(copter.tags, pad.whitelist) &&
        layerPassesBlacklist(copter.tags, pad.blacklist)
    );
}

function layerMatchesWhitelist(tags, whitelist) {
    const rules = parseWhitelistOrBlackList(whitelist);
    return rules.some((rule) => rule.every((tag) => tags.includes(tag)));
}

function layerPassesBlacklist(tags, blacklist) {
    const rules = parseWhitelistOrBlackList(blacklist);
    return rules.every((rule) => rule.every((tag) => !tags.includes(tag)));
}
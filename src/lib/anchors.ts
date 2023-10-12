export function getLandingTransformation(copter, pad, copterPoint, padPoint){
    if(!isNaN(copter?.r1_p1_x)){
        copter.r1_p1_x = Math.min(copter.r1_p1_x, copter.r1_p2_x, copter.r1_p3_x, copter.r1_p4_x)
        copter.r1_p2_x = Math.max(copter.r1_p1_x, copter.r1_p2_x, copter.r1_p3_x, copter.r1_p4_x)
        copter.r1_p3_x = Math.max(copter.r1_p1_x, copter.r1_p2_x, copter.r1_p3_x, copter.r1_p4_x)
        copter.r1_p4_x = Math.min(copter.r1_p1_x, copter.r1_p2_x, copter.r1_p3_x, copter.r1_p4_x)

        copter.r1_p1_y = Math.min(copter.r1_p1_y, copter.r1_p2_y, copter.r1_p3_y, copter.r1_p4_y)
        copter.r1_p2_y = Math.min(copter.r1_p1_y, copter.r1_p2_y, copter.r1_p3_y, copter.r1_p4_y)
        copter.r1_p3_y = Math.max(copter.r1_p1_y, copter.r1_p2_y, copter.r1_p3_y, copter.r1_p4_y)
        copter.r1_p4_y = Math.max(copter.r1_p1_y, copter.r1_p2_y, copter.r1_p3_y, copter.r1_p4_y)
    }
    if(!isNaN(pad?.r1_p1_x)){
        pad.r1_p1_x = Math.min(pad.r1_p1_x, pad.r1_p2_x, pad.r1_p3_x, pad.r1_p4_x)
        pad.r1_p2_x = Math.max(pad.r1_p1_x, pad.r1_p2_x, pad.r1_p3_x, pad.r1_p4_x)
        pad.r1_p3_x = Math.max(pad.r1_p1_x, pad.r1_p2_x, pad.r1_p3_x, pad.r1_p4_x)
        pad.r1_p4_x = Math.min(pad.r1_p1_x, pad.r1_p2_x, pad.r1_p3_x, pad.r1_p4_x)

        pad.r1_p1_y = Math.min(pad.r1_p1_y, pad.r1_p2_y, pad.r1_p3_y, pad.r1_p4_y)
        pad.r1_p2_y = Math.min(pad.r1_p1_y, pad.r1_p2_y, pad.r1_p3_y, pad.r1_p4_y)
        pad.r1_p3_y = Math.max(pad.r1_p1_y, pad.r1_p2_y, pad.r1_p3_y, pad.r1_p4_y)
        pad.r1_p4_y = Math.max(pad.r1_p1_y, pad.r1_p2_y, pad.r1_p3_y, pad.r1_p4_y)
    }
    if(!pad && !padPoint){
        return {
            scale:  1,
            offsetX: 0,
            offsetY: 0,
        }
    }
    if(!copter && copterPoint && padPoint){
        return {
            scale:  1,
            offsetX: (padPoint.p1_x - copterPoint.p1_x),
            offsetY: (padPoint.p1_y - copterPoint.p1_y),
        }
    }
    if(!copter && !pad && (padPoint?.p1_x && copterPoint?.p1_x || padPoint?.p1_y && copterPoint?.p1_y)){
        return {
            scale:  1,
            offsetX: (padPoint.p1_x - copterPoint.p1_x),
            offsetY: (padPoint.p1_y - copterPoint.p1_y),
        }
    }
    if(!pad && !copterPoint){
        return {
            scale:  1,
            offsetX: (padPoint.p1_x - (copter.r1_p1_x +(copter.r1_p2_x - copter.r1_p1_x)/2)),
            offsetY: (padPoint.p1_y - (copter.r1_p1_y +(copter.r1_p4_y - copter.r1_p1_y)/2)),
        }
    }
    if(!copter && !padPoint && copterPoint && pad){
        return {
            scale:  1,
            offsetX: ((pad.r1_p1_x +(pad.r1_p2_x - pad.r1_p1_x)/2) - copterPoint.p1_x),
            offsetY: ((pad.r1_p1_y +(pad.r1_p3_y - pad.r1_p1_y)/2) - copterPoint.p1_y),
        }
    }
    if(pad && !padPoint){
        padPoint = {
            p1_x:(pad.r1_p1_x +(pad.r1_p2_x - pad.r1_p1_x)/2),
            p1_y: (pad.r1_p1_y +(pad.r1_p3_y - pad.r1_p1_y)/2),
        };
    }
    if(!pad && padPoint){
        if(copterPoint){
            return {
                scale:  1,
                offsetX: (padPoint.p1_x - copterPoint.p1_x),
                offsetY: (padPoint.p1_y - copterPoint.p1_y),
            }
        }else{
            return {
                scale:  1,
                offsetX: (padPoint.p1_x - (copter.r1_p1_x +(copter.r1_p2_x - copter.r1_p1_x)/2)),
                offsetY: (padPoint.p1_y - (copter.r1_p1_y +(copter.r1_p4_y - copter.r1_p1_y)/2)),
            }
        }
    }
    if(copter && !copterPoint){
        copterPoint = {
            p1_x:(copter.r1_p1_x +(copter.r1_p2_x - copter.r1_p1_x)/2),
            p1_y: (copter.r1_p1_y +(copter.r1_p3_y - copter.r1_p1_y)/2),
        };
    }

    const copterW = copter.r1_p2_x - copter.r1_p1_x;
    const copterH = copter.r1_p4_y - copter.r1_p1_y;
   
    const padW  = pad.r1_p2_x - pad.r1_p1_x;
    const padH  = pad.r1_p4_y - pad.r1_p1_y;
   
    const copterPadWRatio  = copterW / padW;
    const copterPadHRatio  = copterH / padH;

    let copterPadTotalRatio = Math.max(copterPadWRatio, copterPadHRatio);
   
    const copterBiggerThanPad =  1.0 < copterPadTotalRatio;
    
    let scaledCopter = Object.assign({}, copter)

    if(copterBiggerThanPad){
        // scale down copter, top right as anchor
        scaledCopter.r1_p2_x = scaledCopter.r1_p1_x + ( copterW / copterPadTotalRatio);
        scaledCopter.r1_p3_x = scaledCopter.r1_p2_x;
        scaledCopter.r1_p3_y = scaledCopter.r1_p1_y + ( copterH / copterPadTotalRatio);
        scaledCopter.r1_p4_y = scaledCopter.r1_p3_y;
    }else{
        copterPadTotalRatio = 1;
    }
    // we don't scale up
    
    // align copter inside
    const deltaFreeSpaceX = (pad.r1_p2_x - pad.r1_p1_x) - (scaledCopter.r1_p2_x - scaledCopter.r1_p1_x)
    const deltaFreeSpaceY = (pad.r1_p4_y - pad.r1_p1_y) - (scaledCopter.r1_p4_y - scaledCopter.r1_p1_y)

    const scaledCopterW = scaledCopter.r1_p2_x - scaledCopter.r1_p1_x;
    const scaledCopterH = scaledCopter.r1_p4_y - scaledCopter.r1_p1_y;

    
    scaledCopter.r1_p1_x = pad.r1_p1_x + deltaFreeSpaceX/2;
    scaledCopter.r1_p1_y = pad.r1_p1_y + deltaFreeSpaceY/2;
    
    scaledCopter.r1_p2_x = scaledCopter.r1_p1_x + scaledCopterW;
    scaledCopter.r1_p2_y = pad.r1_p2_y + deltaFreeSpaceY/2;
        
    scaledCopter.r1_p3_x = scaledCopter.r1_p1_x + scaledCopterW;
    scaledCopter.r1_p3_y = scaledCopter.r1_p1_y + scaledCopterH;

    scaledCopter.r1_p4_x = scaledCopter.r1_p1_x;
    scaledCopter.r1_p4_y = scaledCopter.r1_p3_y;

    let transform = {
        scale: copterBiggerThanPad ? 1 / copterPadTotalRatio : 1,
        offsetX: (scaledCopter.r1_p1_x - copter.r1_p1_x * (scaledCopterW / copterW)),
        offsetY: (scaledCopter.r1_p1_y - copter.r1_p1_y * (scaledCopterH / copterH)),
    };

    // use points
    const scaledCenterCopter = {
        p1_x: scaledCopter.r1_p1_x + scaledCopterW / 2,
        p1_y: scaledCopter.r1_p1_y + scaledCopterH / 2,
    }

    const centerPad = {
        p1_x: !isNaN(padPoint?.p1_x) ? padPoint.p1_x : pad.r1_p1_x + padW / 2,
        p1_y: !isNaN(padPoint?.p1_y) ? padPoint.p1_y : pad.r1_p1_y + padH / 2,
    }

    let desiredCopterTranslate = {
        moveX: !isNaN(copterPoint?.p1_x) ? centerPad.p1_x - scaledCenterCopter.p1_x + (copter.r1_p1_x + copterW/2 - copterPoint.p1_x) * scaledCopterW/copterW : centerPad.p1_x - scaledCenterCopter.p1_x,
        moveY: !isNaN(copterPoint?.p1_y) ? centerPad.p1_y - scaledCenterCopter.p1_y + (copter.r1_p1_y + copterH/2 - copterPoint.p1_y) * scaledCopterH/copterH : centerPad.p1_y - scaledCenterCopter.p1_y,
    }

    // try to move but respect bounds deltaFreeSpaceX/2 is the max movement on X Axis
    let actualCopterTranslate = {
        moveX: Math.min(Math.abs(desiredCopterTranslate.moveX), deltaFreeSpaceX/2) * Math.sign(desiredCopterTranslate.moveX),
        moveY: Math.min(Math.abs(desiredCopterTranslate.moveY), deltaFreeSpaceY/2) * Math.sign(desiredCopterTranslate.moveY),
    }

    scaledCopter.r1_p1_x += actualCopterTranslate.moveX
    scaledCopter.r1_p2_x += actualCopterTranslate.moveX
    scaledCopter.r1_p3_x += actualCopterTranslate.moveX
    scaledCopter.r1_p4_x += actualCopterTranslate.moveX
    scaledCopter.r1_p1_y += actualCopterTranslate.moveY
    scaledCopter.r1_p2_y += actualCopterTranslate.moveY
    scaledCopter.r1_p3_y += actualCopterTranslate.moveY
    scaledCopter.r1_p4_y += actualCopterTranslate.moveY

    let transformWithPivots = {
        scale: transform.scale,
        offsetX: (scaledCopter.r1_p1_x - copter.r1_p1_x * (scaledCopterW / copterW)),
        offsetY: (scaledCopter.r1_p1_y - copter.r1_p1_y * (scaledCopterH / copterH)),
    };

    return transformWithPivots;
}
const ArrayMethods = Array.prototype
const hypot = (p1, p2) => Math.hypot(p1.pageX - p2.pageX, p1.pageY - p2.pageY)
const copyTouch = touch => ({ id: touch.identifier, pageX: touch.pageX, pageY: touch.pageY })
const findTouch = (touches, id) => ArrayMethods.find.call(touches, ({ identifier }) => identifier == id)
const sin = Math.sin, cos = Math.cos
const PI = Math.PI / 180
const speed =  (200 / window.innerWidth)

function zero3d(ele,opts){
    let root = (opts&&opts.root),
        O = Object.create(null)
    O.m = new DOMMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])
    O.x = (opts&&opts.x) || 0
    O.y = (opts&&opts.y) || 0
    O.z = (opts&&opts.z) || 0
    O.rx = (opts&&opts.rx) || 0
    O.ry = (opts&&opts.ry) || 0
    O.rz = (opts&&opts.rz) || 0
    O.rzc = (opts&&opts.rzc) || null
    O.size = (opts&&opts.size) || 1
    O.p = (opts&&opts.p) || 0

    let style = ele.style, rzcv = 0
    function render(){
        let x = O.rx*PI, y = O.ry*PI, z = O.rz*PI
        let cx = cos(x), sx = sin(x), cy = cos(y), sy = sin(y), cz = cos(z), sz = sin(z)
        /*
        +-                                                                                                               -+
        |       cy*cz*O.size            -cy*sz*O.size         sy*O.size              cy*cz*O.x-cy*sz*O.y+sy*O.z           |
        | (cx*sz+sx*sy*cz)*O.size  (cx*cz-sx*sy*sz)*O.size  -sx*cy*O.size  -cx*(sz-sx+cz-sx)*sy*cz*O.x+cx*cz-sx*sy*sz*O.y |
        | (sx*sz-cx*sy*cz)*O.size  (sx*cz+cx*sy*sz)*O.size   cx*cy*O.size  -sx*(sz+cx+cz+cx)*sy*cz*O.x+sx*cz+cx*sy*sz*O.y |
        |            0                        0                   0                               1                       |
        +-                                                                                                               -+
        */
        O.m.preMultiplySelf(
           new DOMMatrix([  cy*cz*O.size,                   (cx*sz+sx*sy*cz)*O.size,                            (sx*sz-cx*sy*cz)*O.size,                            0,
                            -cy*sz*O.size,                  (cx*cz-sx*sy*sz)*O.size,                            (sx*cz+cx*sy*sz)*O.size,                            0,
                            sy*O.size,                      -sx*cy*O.size,                                      cx*cy*O.size,                                       0,
                            0,     0,     0,     1
                        ]))
        style.transform = O.m.toString()
        rzcv = (rzcv+O.rz)%360
        O.rzc&&O.rzc.style&&(O.rzc.style.transform = `rotateZ(${rzcv}deg)`)

        O.x = 0
        O.y = 0
        O.z = 0
        O.rx = 0
        O.ry = 0
        O.rz = 0
        O.size = 1

        style.setProperty('--zero3d-separation', O.p + 'px')
    }
    requestAnimationFrame(render) // first render


    let touches = [],
        startTouch = function(e){
            ArrayMethods.push.apply(touches, ArrayMethods.map.call(e.changedTouches, copyTouch))
        },
        endTouch = function(e) {
            ArrayMethods.forEach.call(e.changedTouches, touch => touches.splice(touches.findIndex(({ id }) => id == touch.identifier), 1))
        }

    if(opts&&opts.scalable){
        function scale(e) {
            O.size = Math.min(1000,Math.max(O.size + e.wheelDelta / 1200,0.001))
            requestAnimationFrame(render)
        }
        root.addEventListener("wheel", scale)
        function scaleByTouches(e) {
            if (touches.length >= 2) {
                stopRotateXY()
                O.size *= (hypot(findTouch(e.changedTouches, touches[0].id) || touches[0], findTouch(e.changedTouches, touches[1].id) || touches[1]) / hypot(touches[0], touches[1])) ** 0.05
                requestAnimationFrame(render)
            }
        }
        let start = startTouch,end = endTouch
        startTouch = e =>{
            start(e)
            if(touches.length>=2) root.addEventListener('touchmove', scaleByTouches)
        }
        endTouch = e =>{
            end(e)
            if(touches.length<2) root.removeEventListener('touchmove', scaleByTouches)
        }
    }

    if(opts&&opts.rotatable){
        // rotateXY ALL Pointer include Touches
        let X = 0, Y = 0
        function startRotateXY(e) {
            X = e.clientX
            Y = e.clientY
            root.removeEventListener('pointerdown', startRotateXY)
            document.addEventListener('pointermove', rotateXY)
            document.addEventListener('pointerup', stopRotateXY)
        }
        function stopRotateXY() {
            document.removeEventListener('pointerup', stopRotateXY)
            document.removeEventListener('pointermove', rotateXY)
            root.addEventListener('pointerdown', startRotateXY)
        }
        root.addEventListener('pointerdown', startRotateXY)
        // rotateZ By Pointer
        let Zx = 0, Zy = 0
        function startRotateZ() {
            let p = O.rzc.getBoundingClientRect()
            Zx = p.x + (p.width >> 1)
            Zy = p.y + (p.height >> 1)
            O.rzc.removeEventListener('pointerdown', startRotateZ)
            document.addEventListener('pointermove', rotateZ)
            document.addEventListener('pointerup', stopRotateZ)
            document.addEventListener('pointercancel', stopRotateZ)
        }
        function stopRotateZ() {
            document.removeEventListener('pointercancel', stopRotateZ)
            document.removeEventListener('pointerup', stopRotateZ)
            document.removeEventListener('pointermove', rotateZ)
            O.rzc.addEventListener('pointerdown', startRotateZ)
        }
        O.rzc && O.rzc.addEventListener('pointerdown', startRotateZ)
        // rotateZ By Touches
        let start = startTouch,end = endTouch
        startTouch = e =>{
            start(e)
            if(touches.length>=2) root.addEventListener('touchmove', rotateZByTouches)
        }
        endTouch = e =>{
            end(e)
            if(touches.length<2) root.removeEventListener('touchmove', rotateZByTouches)
        }
        // rotateXY By Pointer cal
        function rotateXY(e) {
            if (touches.length >= 2) return
            O.rx -= (e.pageY - Y) * speed
            O.ry += (e.pageX - X) * speed
            X = e.pageX
            Y = e.pageY
            requestAnimationFrame(render)
        }
        // rotateZ
        function rotateZ(e){
            O.rz = Math.atan2(e.pageY - Zy, e.pageX - Zx) / PI + 180 - rzcv
            requestAnimationFrame(render)
        }
        function rotateZByTouches(e) {
            if (touches.length >= 2) {
                let s1 = touches[0],
                    s2 = touches[1],
                    t1 = findTouch(e.changedTouches, touches[0].id) || touches[0],
                    t2 = findTouch(e.changedTouches, touches[1].id) || touches[1]
                    O.rz += (Math.atan2(t1.pageY-t2.pageY,t1.pageX-t2.pageX)-Math.atan2(s1.pageY-s2.pageY,s1.pageX-s2.pageX))/PI *0.05
                requestAnimationFrame(render)
            }
        }
    }

    root.addEventListener('touchstart', startTouch)
    root.addEventListener('touchend', endTouch)
    root.addEventListener('touchcancel', endTouch)
    return new Proxy(O, {
        set: (t, p, v) => {
            t[p] = v
            requestAnimationFrame(render)
        }
    })
}
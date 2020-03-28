const ArrayMethods = Array.prototype
const hypot = (p1, p2) => Math.hypot(p1.pageX - p2.pageX, p1.pageY - p2.pageY)
const copyTouch = touch => ({ id: touch.identifier, x: touch.pageX, y: touch.pageY })
const findTouch = (touches, id) => ArrayMethods.find.call(touches, ({ identifier }) => identifier == id)

function zero3d(ele, opts) {
    let root = (opts&&opts.root) || ele,
        O = Object.create(null),
        touches = [],
        style = ele.style,
        render = () => {
            style.transform = `translateX(${O.x}) translateY(${O.y}) translateZ(${O.z}) rotateX(${O.rx}deg) rotateY(${O.ry}deg) rotateZ(${O.rz-90}deg) scale3d(${O.size},${O.size},${O.size})`
            style.setProperty('--zero3d-separation', O.p + 'px')
            O.rzc&&O.rzc.style&&(O.rzc.style.transform = `rotateZ(${O.rz}deg)`)
        };
    O.x = (opts&&opts.x) || 0
    O.y = (opts&&opts.y) || 0
    O.z = (opts&&opts.z) || 0
    O.rx = (opts&&opts.rx) || 0
    O.ry = (opts&&opts.ry) || 0
    O.rz = (opts&&opts.rz) || 0
    O.rzc = (opts&&opts.rzc) || null
    O.speed = (opts&&opts.speed) || (200 / window.innerWidth)
    O.size = (opts&&opts.size) || 1
    O.p = (opts&&opts.p) || 0
    render()

    if((opts&&opts.rotatable)){
        const PI = Math.PI / 180
        let X = 0, Y = 0, Zx = 0, Zy = 0
        function rotateXY(e) {
            if (touches.length >= 2) return
            O.rx -= (e.pageY - Y) * O.speed
            O.ry += (e.pageX - X) * O.speed
            X = e.pageX
            Y = e.pageY
            render()
        }
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
        function rotateZ(e) {
            O.rz = Math.atan2(e.pageY - Zy, e.pageX - Zx) / PI + 180
            render()
        }
        function startRotateZ() {
            let p = O.rzc.getBoundingClientRect()
            Zx = p.x + (p.width >> 1)
            Zy = p.y + (p.height >> 1)
            O.rzc.removeEventListener('pointerdown', startRotateZ)
            document.addEventListener('pointermove', rotateZ)
            document.addEventListener('pointerup', stopRotateZ)
        }
        function stopRotateZ() {
            document.removeEventListener('pointerup', stopRotateZ)
            document.removeEventListener('pointermove', rotateZ)
            O.rzc.addEventListener('pointerdown', startRotateZ)
        }
        root.addEventListener('pointerdown', startRotateXY)
        O.rzc && O.rzc.addEventListener('pointerdown', startRotateZ)
    }
    if((opts&&opts.scalable)){
        function startTouch(e) {
            ArrayMethods.push.apply(touches, ArrayMethods.map.call(e.changedTouches, copyTouch))
        }
        function endTouch(e) {
            ArrayMethods.forEach.call(e.changedTouches, touch => touches.splice(touches.findIndex(({ id }) => id == touch.identifier), 1))
        }
        function scale(e) {
            if (e.wheelDelta) {
                O.size += e.wheelDelta / 1200
                render()
            } else if (touches.length >= 2) {
                stopRotateXY()
                O.size *= (hypot(findTouch(e.changedTouches, touches[0].id) || touches[0], findTouch(e.changedTouches, touches[1].id) || touches[1]) / hypot(touches[0], touches[1])) ** 0.1
                render()
            }
        }
        root.addEventListener('touchstart', startTouch)
        root.addEventListener('touchend', endTouch)
        root.addEventListener('touchcancel', endTouch)
        root.addEventListener('touchmove', scale)
        root.addEventListener("wheel", scale)
    }
    return new Proxy(O, {
        set: (t, p, v) => {
            t[p] = v
            render()
        }
    })
}
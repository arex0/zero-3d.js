# zero-3d.js
The smallest cross-platform 3d solution in JS.

## usage
```js
zero3d(element[,options])
```
### options
```js
    {
        rotatable // rotate by mouse or a finger
        scalable // scale by wheel or two fingers
        root // eventListener handle on here
        x // init tranlateX value
        y // init tranlateY value
        z // init tranlateZ value
        rx // init rotateX value
        ry // init rotateY value
        rz // init rotateZ value
        rzc // rotateZ controller, because screen is 2d, you must add another element to control it
        speed // rotateX rotateY speed, default is (200 / window.innerWidth)
        size // scale value
        p // a special value to set separation distance of two layer,
          // you have to add css #zero-3d *{transform: translateZ(var(--zero3d-separation));}
    }
```
### example
I use zero-3d in my app [design 3d](https://arex0.com/apps/design.html), alse you can try this code:
```html
<style>
    :root{
        background: #222;
        user-select: none;
    }
    .center{
        background: rgb(255, 255, 255);
        position: absolute;
        left: 50vw;
        top: 50vh;
        width: 50%;
        height: 50%;
    }
    #zero-3d,
    #zero-3d *{
        transform-style: preserve-3d;
        perspective: 1000px;
    }
    #zero-3d *{
        transform: translateZ(var(--zero3d-separation));
    }
    #rotate-controller{
        font-size: 2em;
        line-height: 5em;
        width: 5em;
        height: 5em;
        border: solid .2em;
        border-radius: 50%;
    }
</style>

<div id='zero-3d' class='center'>
    <div style='background: #fff;color: #000;'>
        I am 3D DIV
    </div>
</div>

<div id='rotate-controller'>⬤</div>
<input id='separation-controller' type='range' oninput='setSeparation(this.value)'
        min='1' max='1000' value='500'>

<script src='./zero-3d.js'></script>
<script>
    let ctl_3d = zero3d(document.getElementById('zero-3d'),{
        rotatable: true,
        scalable: true,
        root: document.body,
        x: '-50%',
        y: '-50%',
        rx: 30,
        ry: 45,
        rz: 60,
        rzc: document.getElementById('rotate-controller'),
        size: .8,
        p: 13.71,
    })
    function setSeparation(d){
        ctl_3d.p = 1/(1.001-(d/1000)**.1) - 1/1.001
    }
</script>
```

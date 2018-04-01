(function(){
    const canvas = document.querySelector('#timelineCanvas');
    const ctx = canvas.getContext('2d');
    const fontEnding = 'px \'Nova Mono\', monospace';
    const zoomSensitivity = 1.1;
    let mouseDown = false;
    let lastMouse = {
        x: 0,
        y: 0
    };
    let xTranslate = 0;
    let zoom = 1;
    let date = new Date();
    window.addEventListener('resize', function(){
        update();
    });
    function positionCanvas(){
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height * 0.1;
    }
    function renderTimeline(ctx, date){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = canvas.height * 0.75 * zoom + fontEnding;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#D4C7BE';
        let year = date.getFullYear() - 5;
        let dateText = String(year);
        //ctx.scale(zoom, zoom);
        for(let i = 0; i < 2; i ++){
            dateText += ' | ' + ++ year;
        }
        let textWidth = ctx.measureText(dateText).width;
        console.log(zoom);
        ctx.translate(xTranslate - textWidth/2, 0);
        ctx.fillText(dateText, canvas.width/2, canvas.height/2);
    }
    function update(){
        let date = new Date();
        positionCanvas();
        renderTimeline(ctx, date);
    }
    document.fonts.ready.then(function(){
        update();
    });
    canvas.addEventListener('mousedown', function(event){
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;
        document.body.addEventListener('mousemove', handleMouseMove);
        mouseDown = true;
    });
    document.body.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseenter', handleMouseUp);
    canvas.addEventListener("wheel", function(event){
        if(event.wheelDeltaY > 0){
            zoom *= zoomSensitivity;
        }else{
            zoom /= zoomSensitivity;
        }
        renderTimeline(ctx, date);

    });
    function handleMouseUp(){
        if(mouseDown){
            document.body.removeEventListener('mousemove', handleMouseMove);
            mouseDown = false;
        }
    }
    function handleMouseMove(event){
        let xDiff = event.clientX - lastMouse.x;
        lastMouse.x = event.clientX;
        xTranslate += xDiff;
        renderTimeline(ctx, date);
    }
}());
//http://phrogz.net/tmp/canvas_zoom_to_cursor.html

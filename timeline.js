(function(){
    const canvas = document.querySelector('#timelineCanvas');
    const ctx = canvas.getContext('2d');
    const fontEnding = 'px \'Nova Mono\', monospace';
    let mouseDown = false;
    let mouseMoveX = -1;
    let mouseMoveY = -1;
    let lastMouse = {
        x: 0,
        y: 0
    };
    let xTranslate = 0;
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
        ctx.font = canvas.height * 0.75 + fontEnding;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#D4C7BE';
        let year = date.getFullYear() - 5;
        let dateText = String(year);
        ctx.translate(xTranslate, 0);
        for(let i = 0; i < 10; i ++){
            dateText += ' | ' + ++ year;
        }
        ctx.fillText(dateText, canvas.width/2 - ctx.measureText(dateText).width/2, canvas.height/2);
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
        document.body.addEventListener('mousemove', handleMouseMove);
        mouseDown = true;
    });
    document.body.addEventListener('mouseup', function(){
        if(mouseDown){
            document.body.removeEventListener('mousemove', handleMouseMove);
            mouseDown = false;
            lastMouse.x = event.clientX;
            lastMouse.y = event.clientY;
        }
    });
    function handleMouseMove(event){
        if(mouseMoveX === -1){
            mouseMoveX = event.clientX;
        }else{
            mouseMoveX = xTranslate;
        }
        if(mouseMoveY === -1) mouseMoveY = event.clientY;
        let xDiff = event.clientX - lastMouse.x;
        console.log(xDiff);
        xTranslate = xDiff;
        //renderTimeline(ctx, date);
    }
}());

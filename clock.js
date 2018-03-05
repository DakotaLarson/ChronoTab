(function(){
    let pi = Math.PI;
    let canvas = document.getElementById('analogCanvas');
    let optIcon = document.querySelector('.optIcon');
    let optParent = document.querySelector('.optParent');
    let ctx = canvas.getContext('2d');
    let canvasSize = positionCanvas();
    let initDate = new Date();
    let dateText = '';
    let datePos = 0;
    let options = {
        invertHands: false,
        alternateSeconds: true,
        smoothRendering: false,
        standardTime: false,
        renderSeconds: true,
        blinkSeparator: false,
        renderDate: false,
        data: {
            secondsInverted: false,
            secondsInvertedMinute: initDate.getMinutes(),
            timeCtxFont: '',
            dateCtxFont: ''
        }
    };
    window.addEventListener('resize', function(){
        ctx.translate(canvasSize/2, canvasSize/2);
        canvasSize = positionCanvas();
        let date = new Date(Date.now());
        computeFontSizes(ctx);
        let secAngle = computeSecondAngle(date);// Must call before generating bool.
        let secondsBool = !options.alternateSeconds && options.invertHands ||
            options.alternateSeconds && !options.invertHands && options.data.secondsInverted ||
            options.alternateSeconds && options.invertHands && !options.data.secondsInverted;
        renderClock(canvasSize, computeHourAngle(date), computeMinuteAngle(date), secAngle,computeTimeText(date), options.invertHands, secondsBool, dateText);
    });
    document.body.addEventListener('click', function(event){
        if(optParent.style.display === 'none'){
            if(event.target === optIcon){
                optParent.style.display = 'inline-block';
            }
        }else{
            if(event.target !== optParent && !optParent.contains(event.target)){
                optParent.style.display = 'none';
            }
        }
    });
    document.body.oncontextmenu = function(){
        return false;
    };
    document.body.addEventListener('keyup', function(event){
        if(event.keyCode === 27){
            if(optParent.style.display !== 'none'){
                optParent.style.display = 'none';
            }
        }
    });
    let switches = document.querySelectorAll('.optToggle');
    for(let i = 0; i< switches.length; i ++){
        let element = switches[i];
        element.addEventListener('click', function(){
            if(element.classList.contains('optToggleToggled')){
                element.classList.remove('optToggleToggled');
                handleSettingsUpdate(element.id, false);
            }else{
                element.classList.add('optToggleToggled');
                handleSettingsUpdate(element.id, true);
            }
        });
    }
    function update(){
        let date = new Date(Date.now());
        let secAngle = computeSecondAngle(date);// Must call before generating bool.
        let secondsBool = !options.alternateSeconds && options.invertHands ||
            options.alternateSeconds && !options.invertHands && options.data.secondsInverted ||
            options.alternateSeconds && options.invertHands && !options.data.secondsInverted;
        renderClock(canvasSize, computeHourAngle(date), computeMinuteAngle(date), secAngle,computeTimeText(date), options.invertHands, secondsBool, dateText);
        if(options.smoothRendering && options.renderSeconds){
            setTimeout(update, 40);
        }else{
            let millis = 1001 - new Date(Date.now()).getMilliseconds();
            setTimeout(update, millis);
        }
    }
    function renderClock(size, hrAngle, minAngle, secAngle, timeText, inverted, secInverted, dateText){
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(size/2, size/2);
        //HOUR
        ctx.strokeStyle = '#233236';
        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.arc(0, 0, size/2*0.95 - 15, 1.5 * pi, hrAngle, inverted);
        ctx.stroke();
        //MINUTE
        ctx.strokeStyle = '#626B66';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(0, 0, size/2*0.95 - 10 - 50, 1.5 * pi, minAngle, inverted);
        ctx.stroke();
        //SECOND
        if(options.renderSeconds){
            ctx.strokeStyle = '#CEA073';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(0, 0, size/2*0.95 - 5 - 90, 1.5 * pi, secAngle, secInverted);
            ctx.stroke();
        }
        //TIME
        ctx.font = options.data.timeCtxFont;
        ctx.fillStyle = '#D4C7BE';
        ctx.fillText(timeText, ctx.measureText(timeText).width / -2, 0);
        //DATE
        if(options.renderDate){
            ctx.fillStyle = '#A4978E';
            ctx.font = options.data.dateCtxFont;
            ctx.fillText(dateText, ctx.measureText(dateText).width / - 2, datePos);
        }
    }
    function positionCanvas(){
        let size = Math.min(window.innerWidth, window.innerHeight);
        canvas.height = size;
        canvas.width = size;
        return size;
    }
    function computeSecondAngle(date){
        if(options.alternateSeconds && options.data.secondsInvertedMinute !== date.getMinutes()){
            options.data.secondsInverted = !options.data.secondsInverted;
            options.data.secondsInvertedMinute = date.getMinutes();
        }
        return ((date.getSeconds() / 60 + date.getMilliseconds() / 1000 / 60) * 2 * pi) - pi / 2;
    }
    function computeMinuteAngle(date){
        return ((date.getMinutes() / 60 + date.getSeconds() / 60 / 60 + date.getMilliseconds() / 1000 / 60 / 60) * 2 * pi) - pi / 2;
    }
    function computeHourAngle(date){
        return ((date.getHours() % 12 / 12 + date.getMinutes() / 60 / 12 + date.getSeconds() / 60 / 60 / 12 + date.getMilliseconds() / 1000 / 60 / 60 / 12) * 2 * pi) - pi / 2;
    }
    function computeTimeText(date){
        let text = '';
        let separator = ':';
        let ending = '';
        let hours = date.getHours();
        if(options.standardTime){
            if(hours > 12){
                ending = ' PM';
            }else{
                ending = ' AM';
            }
            hours =  hours % 12 || 12;
        }
        if(options.blinkSeparator && date.getSeconds() % 2 === 0){
            separator = ' ';
        }
        if(hours < 10){
            text += '0';
        }
        text += hours + separator;
        if(date.getMinutes() < 10){
            text += '0';
        }
        text += date.getMinutes();
        if(options.renderSeconds){
            text += separator;
            if(date.getSeconds() < 10){
                text += '0';
            }
            text += date.getSeconds();
        }
        text += ending;
        return text;
    }
    function computeDateText(date){
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }
    function computeFontSizes(ctx){
        //TIME
        let text = '00:00';
        if(options.renderSeconds){
            text += ':00'
        }
        if(options.standardTime){
            text += ' XM';
        }
        let fontSize = 300;
        options.data.timeCtxFont = fontSize + 'px sans-serif';
        ctx.font = options.data.timeCtxFont;
        let textWidth = ctx.measureText(text).width;
        while(textWidth > canvasSize * 0.85 - 200){
            fontSize -= 5;
            options.data.timeCtxFont = fontSize + 'px sans-serif';
            ctx.font = options.data.timeCtxFont;
            textWidth = ctx.measureText(text).width;
            if(fontSize <= 0){
                fontSize = 0;
                break;
            }
        }
        datePos = fontSize / 2;
        //DATE
        fontSize = 200;
        options.data.dateCtxFont = fontSize + 'px sans-serif';
        ctx.font = options.data.dateCtxFont;
        textWidth = ctx.measureText(dateText).width;
        while(textWidth > canvasSize * 0.75 - 200){
            fontSize -= 5;
            options.data.dateCtxFont = fontSize + 'px sans-serif';
            ctx.font = options.data.dateCtxFont;
            textWidth = ctx.measureText(dateText).width;
            if(fontSize <= 0){
                fontSize = 0;
                break;
            }
        }
    }
    function handleSettingsUpdate(id, toggled){
        let value = '0';
        if(toggled){
            value = '1';
        }
        localStorage.setItem(id, value);
        if(id === 'sr'){
            options.smoothRendering = toggled;
        }else if(id === 'st'){
            options.standardTime = toggled;
            computeFontSizes(ctx);
        }else if(id === 'ih'){
            options.invertHands = toggled;
        }else if(id === 'rs'){
            options.renderSeconds = toggled;
            computeFontSizes(ctx);
        }else if(id === 'as'){
            options.alternateSeconds = toggled;
        }else if(id === 'bs') {
            options.blinkSeparator = toggled;
        }else if(id === 'rd'){
            options.renderDate = toggled;
            computeFontSizes(ctx);
        }else{
            console.log('Unknown toggle ID');
        }
    }
    function initFromStorage(){
        if(!localStorage.sr){
            localStorage.sr = 0;
            options.smoothRendering = false;
        }else{
            options.smoothRendering = localStorage.sr === '1';
            if(options.smoothRendering){
                document.querySelector('#sr').classList.add('optToggleToggled');
            }
        }if(!localStorage.st){
            localStorage.st = 0;
            options.standardTime = false;
        }else{
            options.standardTime = localStorage.st === '1';
            if(options.standardTime){
                document.querySelector('#st').classList.add('optToggleToggled');
            }
        }
        if(!localStorage.ih){
            localStorage.ih = 0;
            options.invertHands = false;
        }else{
            options.invertHands = localStorage.ih === '1';
            if(options.invertHands){
                document.querySelector('#ih').classList.add('optToggleToggled');
            }
        }if(!localStorage.rs){
            localStorage.rs = 1;
            options.renderSeconds = true;
            document.querySelector('#rs').classList.add('optToggleToggled');
        }else{
            options.renderSeconds = localStorage.rs === '1';
            if(options.renderSeconds){
                document.querySelector('#rs').classList.add('optToggleToggled');
            }
        }if(!localStorage.as){
            localStorage.as = 1;
            options.alternateSeconds = true;
            document.querySelector('#as').classList.add('optToggleToggled');
        }else{
            options.alternateSeconds = localStorage.as === '1';
            if(options.alternateSeconds){
                document.querySelector('#as').classList.add('optToggleToggled');
            }
        }if(!localStorage.bs){
            localStorage.bs = 0;
        }else{
            options.blinkSeparator = localStorage.bs === '1';
            if(options.blinkSeparator){
                document.querySelector('#bs').classList.add('optToggleToggled');
            }
        }
        if(!localStorage.rd){
            localStorage.rd = 1;
            document.querySelector('#rd').classList.add('optToggleToggled');
            options.renderDate = true;
        }else{
            options.renderDate = localStorage.rd === '1';
            if(options.renderDate){
                document.querySelector('#rd').classList.add('optToggleToggled');
            }
        }
    }
    function updateDateText(){
        let date = new Date();
        dateText = computeDateText(date);
        let nextDate = new Date(date);
        nextDate.setMilliseconds(0);
        nextDate.setSeconds(0);
        nextDate.setMinutes(0);
        nextDate.setHours(0);
        nextDate.setDate(date.getDate() + 1);
        let diff = nextDate - date;
        setTimeout(updateDateText, diff);
    }
    initFromStorage();
    updateDateText();
    computeFontSizes(ctx);
    update();
}());

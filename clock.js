(function(){
    const pi = Math.PI;
    const canvas = document.querySelector('#clockCanvas');
    const optIcon = document.querySelector('.optIcon');
    const  optParent = document.querySelector('.optParent');
    const ctx = canvas.getContext('2d');
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const fontEnding = 'px \'Nova Mono\', monospace';
    const options = {
        invertHands: false,
        alternateSeconds: true,
        smoothRendering: false,
        standardTime: false,
        renderSeconds: true,
        blinkSeparator: false,
        renderDate: false,
        data: {
            secondsInverted: false,
            secondsInvertedMinute: new Date().getMinutes(),
            timeCtxFont: '',
            dateCtxFont: ''
        },
        colors: {
            bCol: '#040c0e',
            hCol: '#233236',
            mCol: '#626b66',
            sCol: '#cea073',
            tCol: '#d4c7be',
            dCol: '#a4978e'
        }

    };
    let canvasSize = positionCanvas();
    let dateText = '';
    let datePos = 0;

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
    let switches = optParent.querySelectorAll('input[type="checkbox"]');
    for(let i = 0; i< switches.length; i ++){
        let element = switches[i];
        element.addEventListener('click', function(){
            if(element.checked){
                handleSettingsUpdate(element.id, true);
            }else{
                handleSettingsUpdate(element.id, false);
            }
        });
    }
    optParent.querySelector('#colorReset').addEventListener('click', function(){
        let codes = Object.keys(options.colors);
        let resetColors = {
            bCol: '#040c0e',
            hCol: '#233236',
            mCol: '#626b66',
            sCol: '#cea073',
            tCol: '#d4c7be',
            dCol: '#a4978e'
        };
        for(let i = 0; i < codes.length; i ++){
            let id = codes[i];
            localStorage.removeItem(codes[i]);
            optParent.querySelector('#' + id).value = resetColors[id];
            let selectorText = '#' + id + 'Text';
            optParent.querySelector(selectorText).textContent = resetColors[id];
        }
        options.colors = resetColors;
        document.body.style.backgroundColor = resetColors.bCol;
        updateIconColor(resetColors.bCol);

    });
    let colorSwitches = optParent.querySelectorAll('input[type="color"]');
    for(let i = 0; i< colorSwitches.length; i ++){
        let element = colorSwitches[i];
        element.addEventListener('change', function(){
            localStorage[element.id] = element.value;
            options.colors[element.id] = element.value;
            let selectorText = '#' + element.id + 'Text';
            optParent.querySelector(selectorText).textContent = element.value;
            if(element.id === 'bCol'){
                document.body.style.backgroundColor = element.value;
                updateIconColor(element.value);
            }
        })
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
        ctx.strokeStyle = options.colors.hCol;
        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.arc(0, 0, size/2*0.95 - 15, 1.5 * pi, hrAngle, inverted);
        ctx.stroke();
        //MINUTE
        ctx.strokeStyle = options.colors.mCol;
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(0, 0, size/2*0.95 - 10 - 50, 1.5 * pi, minAngle, inverted);
        ctx.stroke();
        //SECOND
        if(options.renderSeconds){
            ctx.strokeStyle = options.colors.sCol;
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(0, 0, size/2*0.95 - 5 - 90, 1.5 * pi, secAngle, secInverted);
            ctx.stroke();
        }
        //TIME
        ctx.font = options.data.timeCtxFont;
        ctx.fillStyle = options.colors.tCol;
        ctx.fillText(timeText, ctx.measureText(timeText).width / -2, 0);
        //DATE
        if(options.renderDate){
            ctx.fillStyle = options.colors.dCol;
            ctx.font = options.data.dateCtxFont;
            ctx.fillText(dateText, ctx.measureText(dateText).width / - 2, datePos);
        }
    }
    function positionCanvas(){
        let width = window.innerWidth;
        let height = window.innerHeight;
        let size = Math.min(width, height);
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
            if(hours >= 12){
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
        options.data.timeCtxFont = fontSize + fontEnding;
        ctx.font = options.data.timeCtxFont;
        let textWidth = ctx.measureText(text).width;
        while(textWidth > canvasSize * 0.85 - 200){
            fontSize -= 5;
            options.data.timeCtxFont = fontSize + fontEnding;
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
        options.data.dateCtxFont = fontSize + fontEnding;
        ctx.font = options.data.dateCtxFont;
        textWidth = ctx.measureText(dateText).width;
        while(textWidth > canvasSize * 0.75 - 200){
            fontSize -= 5;
            options.data.dateCtxFont = fontSize + fontEnding;
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
                optParent.querySelector('#sr').checked = true;
            }
        }if(!localStorage.st){
            localStorage.st = 1;
            options.standardTime = true;
            optParent.querySelector('#st');
        }else{
            options.standardTime = localStorage.st === '1';
            if(options.standardTime){
                optParent.querySelector('#st').checked = true;
            }
        }
        if(!localStorage.ih){
            localStorage.ih = 0;
            options.invertHands = false;
        }else{
            options.invertHands = localStorage.ih === '1';
            if(options.invertHands){
                optParent.querySelector('#ih').checked = true;
            }
        }if(!localStorage.rs){
            localStorage.rs = 1;
            options.renderSeconds = true;
            optParent.querySelector('#rs').checked = true;
        }else{
            options.renderSeconds = localStorage.rs === '1';
            if(options.renderSeconds){
                optParent.querySelector('#rs').checked = true;
            }
        }if(!localStorage.as){
            localStorage.as = 1;
            options.alternateSeconds = true;
            optParent.querySelector('#as').checked = true;
        }else{
            options.alternateSeconds = localStorage.as === '1';
            if(options.alternateSeconds){
                optParent.querySelector('#as').checked = true;
            }
        }if(!localStorage.bs){
            localStorage.bs = 0;
        }else{
            options.blinkSeparator = localStorage.bs === '1';
            if(options.blinkSeparator){
                optParent.querySelector('#bs').checked = true;
            }
        }
        if(!localStorage.rd){
            localStorage.rd = 1;
            optParent.querySelector('#rd').checked = true;
            options.renderDate = true;
        }else{
            options.renderDate = localStorage.rd === '1';
            if(options.renderDate){
                optParent.querySelector('#rd').checked = true;
            }
        }
        if(localStorage.bCol){
            options.colors.bCol = localStorage.bCol;
            document.body.style.backgroundColor = options.colors.bCol;
            updateIconColor(options.colors.bCol);
            optParent.querySelector('#bCol').value = options.colors.bCol;
            optParent.querySelector('#bColText').textContent = options.colors.bCol;
        }
        if(localStorage.hCol){
            options.colors.hCol = localStorage.hCol;
            optParent.querySelector('#hCol').value = options.colors.hCol;
            optParent.querySelector('#hColText').textContent = options.colors.hCol;
        }
        if(localStorage.mCol){
            options.colors.mCol = localStorage.mCol;
            optParent.querySelector('#mCol').value = options.colors.mCol;
            optParent.querySelector('#mColText').textContent = options.colors.mCol;
        }
        if(localStorage.sCol){
            options.colors.sCol = localStorage.sCol;
            optParent.querySelector('#sCol').value = options.colors.sCol;
            optParent.querySelector('#sColText').textContent = options.colors.sCol;
        }
        if(localStorage.tCol){
            options.colors.tCol = localStorage.tCol;
            optParent.querySelector('#tCol').value = options.colors.tCol;
            optParent.querySelector('#tColText').textContent = options.colors.tCol;
        }
        if(localStorage.dCol){
            options.colors.dCol = localStorage.dCol;
            optParent.querySelector('#dCol').value = options.colors.dCol;
            optParent.querySelector('#dColText').textContent = options.colors.dCol;
        }
    }
    function updateIconColor(hex){
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        let brightness = Math.sqrt((r * r * 0.241) + (g * g * 0.691) + (b * b * 0.068));
        if(brightness > 128){
            document.querySelector('.optIcon').style.fill = '#000000';
        }else{
            document.querySelector('.optIcon').style.fill = '#ffffff';
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
    let font = new FontFace('Nova Mono', 'url(NovaMonoLatin.woff2');
    font.loaded.then(function(){
        computeFontSizes(ctx);
        update();
    });
    document.fonts.add(font);
    font.load();
    initFromStorage();
    updateDateText();
}());

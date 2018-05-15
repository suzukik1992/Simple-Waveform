autowatch = 1;

outlets = 2;

mgraphics.init();
mgraphics.relative_coords = 1;
mgraphics.autofill = 0;

var buf = new Buffer("buffer");
var seg;
var amp;
var smp = buf.framecount();
var l_w;
var aspect = calcAspect();
var pos = [smp/2];
var pos_c;
var dis_1 = smp/2;
var dis_2 = smp/2;
var dis_1_c, dis_2_c;
var x_c, y_c, x_smp;
var x_d = [];
var y_d = [];
var z_rate = 1;
var rate = 500;

//set up
function bang(){
    mgraphics.redraw();
}

// set amp
function msg_float(val){
    amp = val;
    mgraphics.redraw();
}

//set segment
function msg_int(val){
    seg = val;
    mgraphics.redraw();
}

//set line width
function line_width(val){
    l_w = val;
    mgraphics.redraw();
}

function paint(){
    mgraphics.set_line_width(l_w);
    
    for(var i=0; i<seg; i++){
        var ind = i*((dis_1+dis_2)/seg)+pos[0]-dis_1;
        var y = Math.abs(buf.peek(1,r_diff(Math.round(ind)),1)*amp);
        mgraphics.move_to(-1*aspect+i*2*aspect/seg, y);
        mgraphics.line_to(-1*aspect+i*2*aspect/seg, -y);
	}
    mgraphics.stroke();
    outlet(1,Math.floor(pos[0]+dis_2));
    outlet(0,Math.floor(pos[0]-dis_1));
    
}

// click
function onclick(x,y){
    var xy_c = sketch.screentoworld(x,y);
    //0~x_c~1
    x_c = (xy_c[0]/aspect+1)/2;
    x_d.unshift(x_c);
    //-1~y_c~1
    y_d.unshift(xy_c[1]);
    
    pos.unshift(x_c*(dis_1+dis_2)+pos[0]-dis_1);
    pos.slice(0,2);
    
    dis_1 = dis_1-(pos[1]-pos[0]);
    dis_2 = dis_2+(pos[1]-pos[0]);
}

function r_diff(s){
    var a = rate;
    if((dis_1+dis_2)>150000)
        ;
    else if((dis_1+dis_2)<=150000)
        a = rate - rate*0.998*(1-(dis_1+dis_2)/150000);
    return Math.round(a*Math.floor(s/a));
}

// drag
function ondrag(x,y){
    var xy_d = sketch.screentoworld(x,y);
    //0~x_d~+
    x_d.unshift((xy_d[0]/aspect+1)/2);
    x_d.slice(0,2);
    var dis_1_d = dis_1+(dis_1+dis_2)*(x_d[0]-x_d[1]);
    var dis_2_d = dis_2-(dis_1+dis_2)*(x_d[0]-x_d[1]);
    dis_1 = dis_1_d;
    if(pos[0]-dis_1<0)
        dis_1 = pos[0]
    dis_2 = dis_2_d;
    if(pos[0]+dis_2>smp)
        dis_2 = smp-pos[0];
    
    //-~y_d~+
    y_d.unshift(xy_d[1]);
    y_d.slice(0,2);
    if(Math.abs(y_d[0]-y_d[1])>0.025)
        z_rate = 1+(y_d[0]-y_d[1]);
    else
        z_rate = 1;
    
    //zoom in
    if((dis_1+dis_2)*z_rate<500)
        z_rate = 500/(dis_1+dis_2);
    var dis_d = (dis_1+dis_2)*z_rate;
    dis_1_d = dis_d*dis_1/(dis_1+dis_2);
    dis_2_d = dis_d*dis_2/(dis_1+dis_2);
    dis_1 = dis_1_d;
    if(pos[0]-dis_1<0)
        dis_1 = pos[0];
    dis_2 = dis_2_d;
    if(pos[0]+dis_2>smp)
        dis_2 = smp-pos[0];
    
    mgraphics.redraw();
}

// calcurate aspect
function calcAspect(){
    var w = this.box.rect[2] - this.box.rect[0];
    var h = this.box.rect[3] - this.box.rect[1];
    return w/h;
}




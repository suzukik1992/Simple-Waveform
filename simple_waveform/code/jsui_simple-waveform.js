autowatch = 1;

outlets = 3;

mgraphics.init();
mgraphics.relative_coords = 1;
mgraphics.autofill = 0;

var buf = new Buffer("buffer");
var amp;
var smp = buf.framecount();
var aspect = calcAspect();
var pos = [smp/2];
var dis_1 = smp/2;
var dis_2 = smp/2;
var dis_1_c, dis_2_c;
var x_c, y_c;
var x_d = [];
var y_d = [];
var z_rate = 1;
var scale_x = 1;
var scale_y = 1;
var zoom_max = 500;
var buffer = [];
var max = new Array(6);
var seg = [200,250,350,400,550,750];
var l_w = [0.029,0.023,0.015,0.010,0.007,0.004];
var range = [smp,65000,25000,10000,5000,1000];
var bl = [];
var line_width = l_w[0];
var segment = seg[0];


//initialize buffers
for(var i=0;i<seg.length;i++){
    bl[i] = Math.ceil(range[i]/seg[i]);
    max[i] = new Array(Math.round(smp/bl[i]));
    for(var j=0;j<smp/bl[i];j++){
        for(var l=bl[i]*j;l<bl[i]*j+bl[i];l++){
            buffer.push(buf.peek(1,l,1));
        }
        max[i][j] = Math.max.apply(null,buffer);
        buffer.length = 0;
    }
}

//set scale
function list(){
    var scale = arrayfromargs(arguments);
    scale_x = scale[0];
    scale_y = scale[1];
    mgraphics.redraw();
}

// set amp
function msg_float(val){
    amp = val;
    mgraphics.redraw();
}

function paint(){
    mgraphics.set_line_width(line_width);
    mgraphics.scale(scale_x,scale_y);
    for(var i=0; i<segment; i++){
        var ind = i*((dis_1+dis_2)/segment)+pos[0]-dis_1;
        y = Math.abs(r_diff(ind));
        mgraphics.move_to(-1*aspect+i*2*aspect/segment, y);
        mgraphics.line_to(-1*aspect+i*2*aspect/segment, -y);
	}
    mgraphics.stroke();
    outlet(2,Math.floor(dis_1+dis_2));
    outlet(1,Math.floor(pos[0]+dis_2));
    outlet(0,Math.floor(pos[0]-dis_1));
    
}

function r_diff(s){
    if((dis_1+dis_2)>=range[1]){
        segment = seg[0];
        line_width = l_w[0];
        return max[0][Math.round(s/bl[0])];
    }
    else if((dis_1+dis_2)<range[1]){
        if(dis_1+dis_2>=range[2] && dis_1+dis_2<range[1]){
            segment = seg[1];
            line_width = l_w[1];
            return max[1][Math.round(s/bl[1])];
        }
        else if(dis_1+dis_2>=range[3] && dis_1+dis_2<range[2]){
            segment = seg[2];
            line_width = l_w[2];
            return max[2][Math.round(s/bl[2])];
        }
        else if(dis_1+dis_2>=range[4] && dis_1+dis_2<range[3]){
            segment = seg[3];
            line_width = l_w[3];
            return max[3][Math.round(s/bl[3])];
        }
        else if(dis_1+dis_2>=range[5] && dis_1+dis_2<range[4]){
            segment = seg[4];
            line_width = l_w[4];
            return max[4][Math.round(s/bl[4])];
        }
        else{
            segment = seg[5];
            line_width = l_w[5];
            return max[5][Math.round(s/bl[5])];
        }
    }
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
    
    //-~y_d~+s
    y_d.unshift(xy_d[1]);
    y_d.slice(0,2);
    if (dis_1+dis_2>=smp)
        z_rate = 1;
    else if(Math.abs(y_d[0]-y_d[1])>0.025)
        z_rate = 1+(y_d[0]-y_d[1]);
    else
        z_rate = 1;
    
    //zoom in
    if((dis_1+dis_2)*z_rate<zoom_max)
        z_rate = zoom_max/(dis_1+dis_2);
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




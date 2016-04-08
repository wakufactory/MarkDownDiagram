var mdg_draw = function(_base,_pstyle) {
	
this.base = $(_base) ;
this.pstyle = $(_pstyle) ;
this.svg = $("svg",base) ;
this.bpos = {} ;	
this.em = 16 ;

if(this.svg.length==0) {
	this.svg = $(document.createElement("svg")) ;
	this.base.append(this.svg) ;
}

this.setobj = function(data) {
	$('div,table',this.base).remove() ;
	for(var i in data.box) {
		var pos = create(true,data.box[i]) ;
		this.bpos[data.box[i].id] = pos ;
	}
}
this.redraw = function(data) {	
	var s = [] ;
	for(var id in this.bpos) {
		s.push(`#${id} {left:${this.bpos[id].x}rem;top:${this.bpos[id].y}rem;}`)
	}
	this.pstyle.html( s.join("\n")) ;
	s=[] ;
	for(var i in data.conn) {	
		var c = data.conn[i]
		var l = connect($("#"+c.from),$("#"+c.to),c.param) ;
		for(var j in l) s.push(l[j]) ;
	}
	this.svg.html(s.join("")) ;
	
}
this.savepos = function(id,x,y) {
//	console.log(`savepos ${id} ${x}-${y}`) ;
	this.bpos[id] = {x:parseFloat(x),y:parseFloat(y)} ;
}

function round(x) { return Math.floor(x*10)/10; }
var lp = {x:0,y:0} ;
function create(editable,box) {
	var d = editable?"true":"false" ;
	var type,inner ;
	if(typeof box.inner == "object") {
		type ="<table>" ;
		inner = "<tr><td>"+box.inner.join("</td></tr><tr><td>")+"</td></tr>" ;
		if(box.title) inner = "<tr><th>"+box.title+"</th></tr>" +inner ;
	} else {
		type = "<div>" ;
		inner = box.inner ;
	}
	var pos = box.pos ;
	if(pos==undefined) {
		pos = {x:parseInt(lp.x)+5,y:parseInt(lp.y)+2} ;
		console.log(pos);
	}

	var e = $(type).addClass("box").attr('id',box.id).attr('title',box.id).
		attr('draggable',d).html(inner) ;
	if(box.cls) {
		if(typeof box.cls == "string") box.cls = [box.cls] ;
		for(var i in box.cls) e.addClass(box.cls[i]) ;
	}
	$('#base').append(e) ;
	lp = pos ;
	return pos ;
}
function connect(o1,o2,param) {
	var em = 16 ;
	function s(o,f) {
		var sx = parseInt(o.css('left')) ;
		var sy = parseInt(o.css('top')) ;
		var w = parseInt(o.css('width')) ;
		var h = parseInt(o.css('height')) ;
		var px,py,vx,vy ;
		var t = $('tr',o) ;
		if(t.length>0 && f.match(/(l|r)([0-9]+)/)) {
			vy = 0 ;
			if(RegExp.$1=="l") {
				px = sx ;
				vx = -1 ;
			} else if(RegExp.$1=="r") {
				px = sx+w ;
				vx = 1 ;
			}
			var tn = RegExp.$2-1 ;
			py = sy + t[tn].offsetTop+t[tn].offsetHeight/2 ;
		} else {
			switch(f.substr(0,1)) {
				case 'u':
					px = sx+w/2 ;py = sy ; vx=0 ;vy=-1; break ;
				case 'd':
					px = sx+w/2 ;py = sy+h ; vx=0;vy=1; break ;
				case 'l':
					px = sx ;py = sy + h/2 ; vx=-1;vy=0; break ;
				case 'r':
					px = sx+w ;py = sy + h/2 ; vx=1;vy=0; break ;
				default:
			}
		}
		return {x:px,y:py,vx:vx,vy:vy} ;
	}
	var sp = s(o1,param.s_pos) ;
	var ep = s(o2,param.e_pos) ;
	var ret = [] ;
//	console.log(sp); 
//	console.log(ep) ;
	var style = 'stroke:'+((param.col)?param.col:"#000")+';stroke-width:'+((param.width)?param.width:1)+';' ;
	var cls = (param.cls)?'class="'+param.cls+'"':"" ;
	if(param.type=="s") {
		ret.push(`<path d="M ${sp.x} ${sp.y} L ${ep.x} ${ep.y}" ${cls} />`) ;
	} else {
		var pm = 100 ;
		ret.push(`<path d="M ${sp.x} ${sp.y} C ${sp.x+sp.vx*pm} ${sp.y+sp.vy*pm} ${ep.x+ep.vx*pm} ${ep.y+ep.vy*pm} ${ep.x} ${ep.y}" ${cls} />`) ;
	}
	if(param.arrow) {
		var th = 3.14159*20/180 ;
		var an = 20 ;
		var v,p ;
		function rot(v,th) {
			var px = v.x * Math.cos(th) - v.y * Math.sin(th) ;
			var py = v.x * Math.sin(th) + v.y * Math.cos(th) ;
			var vn = Math.sqrt(px*px+py*py) ;
			return {x:px/vn,y:py/vn} ;		
		}
		function av(sp,ep) {
			v = (param.type=="s")?{x:sp.x-ep.x ,y:sp.y-ep.y}:{x:ep.vx,y:ep.vy} ;
			p1 = rot(v,th) ;
			p2 = rot(v,-th) ;
			ret.push(`<path d="M ${round(ep.x+p1.x*an)} ${round(ep.y+p1.y*an)} L ${ep.x} ${ep.y} L ${round(ep.x+p2.x*an)} ${round(ep.y+p2.y*an)}" ${cls} style="stroke-dasharray:0" />`)
		}
		if(param.arrow=="b"||param.arrow=="t") av(sp,ep) ;
		if(param.arrow=="b"||param.arrow=="f") av(ep,sp) ;
	}
	return ret //	return {sp:sp,ep:ep} ;
}
}


var mdg_draw = function(_base) {
	
this.base = $(_base) ;
this.svg = $("svg",base) ;
this.bpos = {} ;	
this.em = parseInt($('html').css('font-size')) ;

var lp,le ;
this.setobj = function(data,delay) {
	$('div,table',this.base).remove() ;
	lp = {x:1,y:1} ;
	for(var i in data.box) {
		var pos = this.create(true,data.box[i]) ;
		this.bpos[data.box[i].id] = pos ;
	}
	var self = this ;
	this.redraw(data,delay);
}
this.redraw = function(data,delay) {	
	var s = [] ;
	for(var id in this.bpos) {
		$('#'+id).css('left',this.bpos[id].x+"rem").css('top',this.bpos[id].y+"rem") ;
	}
	var base = this.base ;
	setTimeout(function() {
		s=[] ;
		for(var i in data.conn) {	
			var c = data.conn[i]
			var l = connect($("#"+c.from),$("#"+c.to),c.param) ;
			if(l==null) continue ;
			for(var j in l) s.push(l[j]) ;
		}
		$("svg",base).remove() ;
		base.append("<svg>"+ s.join("")+"</svg>") ;
	},(delay==true)?500:0) ;

}
this.setpos = function(id,x,y) {
//	console.log(`savepos ${id} ${x}-${y}`) ;
	this.bpos[id] = {x:parseFloat(x),y:parseFloat(y)} ;
}

function round(x) { return Math.floor(x*10)/10; }

// create dom block 
this.create = function(editable,box) {
	var d = editable?"true":"false" ;
	var type,inner ;
	if(typeof box.inner == "object" || box.title!=null) {
		if(typeof box.inner != "object") box.inner = [box.inner] ;
		for(var tr in box.inner) {
			var tt = box.inner[tr].split(" | ") ;
			if(tt.length>1) {
				box.inner[tr] = tt.join("</td><td>") ;
			} 
		}
		type ="<table>" ;
		inner = "<tr><td>"+box.inner.join("</td></tr><tr><td>")+"</td></tr>" ;
		if(box.title!=null) inner = "<tr><th>"+box.title+"</th></tr>" +inner ;
	} else {
		type = "<div>" ;
		inner = box.inner ;
	}
	var pos = box.pos ;
	if(pos==undefined) {
		pos =  lp ;
	}

	var e = $(type).addClass("box").attr('id',box.id).attr('title',box.id).
		attr('draggable',d).html(inner) ;
	if(box.cls) {
		if(typeof box.cls == "string") box.cls = [box.cls] ;
		for(var i in box.cls) e.addClass(box.cls[i]) ;
	}
	this.base.append(e) ;
	lp = {x:parseInt(pos.x) + round(parseInt(e.css('width'))/this.em)+2,y:parseInt(pos.y)+1};
	return pos ;
}
// draw connect line 
function connect(o1,o2,param) {
	if(o1.length==0 || o2.length==0) return null ;
	
	function s(o,f) {
		var sx = parseInt(o.css('left')) ;
		var sy = parseInt(o.css('top')) ;
		var w = parseInt(o.css('width')) ;
		var h = parseInt(o.css('height')) ;
		var px,py,vx,vy ;
		var t = $('tr',o) ;
		var d = $('th,td',o) ;
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
		} else if(d.length>0 && f.match(/(u|d)([0-9]+)/)) {
			vx = 0 ;
			if(RegExp.$1=="u") {
				py = sy ;
				vy = -1 ;
			} else if(RegExp.$1=="d") {
				py = sy+h ;
				vy = 1 ;
			}
			var tn = (RegExp.$2!=undefined)?RegExp.$2-1:0 ;
			px = sx + d[tn].offsetLeft+d[tn].offsetWidth/2 ;
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
	var cls = "" ;
	if(param.cls) {
		var c = param.cls.split(" ") ;
		var cc = [] ;
		for(var i in c) {
			if(c[i].match(/^S|B$/)) {
				param.type = c[i] ;
			} else cc.push(c[i]) ;
		}
		if(cc.length>0) cls = 'class="'+cc.join(" ")+'"' ;
	}
	if(param.type=="S") {
		ret.push(`<path d="M ${sp.x} ${sp.y} L ${ep.x} ${ep.y}" ${cls} />`) ;
	} else {
		var pm = 50 ;
		ret.push(`<path d="M ${sp.x} ${sp.y} C ${sp.x+sp.vx*pm} ${sp.y+sp.vy*pm} ${ep.x+ep.vx*pm} ${ep.y+ep.vy*pm} ${ep.x} ${ep.y}" ${cls} />`) ;
	}
	if(param.arrow) {
		var th = 3.14159*20/180 ;
		var an = 15 ;
		var v,p ;
		function rot(v,th) {
			var px = v.x * Math.cos(th) - v.y * Math.sin(th) ;
			var py = v.x * Math.sin(th) + v.y * Math.cos(th) ;
			var vn = Math.sqrt(px*px+py*py) ;
			return {x:px/vn,y:py/vn} ;		
		}
		function av(sp,ep) {
			v = (param.type=="S")?{x:sp.x-ep.x ,y:sp.y-ep.y}:{x:ep.vx,y:ep.vy} ;
			p1 = rot(v,th) ;
			p2 = rot(v,-th) ;
			ret.push(`<path d="M ${round(ep.x+p1.x*an)} ${round(ep.y+p1.y*an)} L ${ep.x} ${ep.y} L ${round(ep.x+p2.x*an)} ${round(ep.y+p2.y*an)}" ${cls} style="stroke-dasharray:0" />`)
		}
		if(param.arrow=="b"||param.arrow=="t") av(sp,ep) ;
		if(param.arrow=="b"||param.arrow=="f") av(ep,sp) ;
	}
	return ret //	return {sp:sp,ep:ep} ;
}
// md parser
this.m_h = /^\[([a-z0-9-_]+)\]\s*(?:\((.*)\))?\s*(?:<([0-9\.]+),([0-9\.]+)>)?$/ ;
this.m_comm = /^\/\// ;
this.parse = function(text) {
	var box = [] ;
	var conn = [] ;
	var l = text.split("\n") ;
	var b = {id:"",bl:[]} ;
	for(var i in l) {
		var cl = l[i] ;
		var a ;
		if(cl=="") continue ;
		if(this.m_comm.exec(cl)) {
			continue ;	
		}else 
		if(a = this.m_h.exec(cl)) {
			if(b.bl.length>0) {
				pbox(b) ;
			}
			b.id = a[1] ;
			b.bl = [] ;
			b.cls = a[2] ;
			b.pos = (a[3]!=undefined && a[4]!=undefined)?{x:a[3],y:a[4]}:undefined ;
		} else {
			b.bl.push( cl );
		}
	}
	if(b.bl.length>0) pbox(b) ;

	function pbox(b) {
		var l = [] ;
		var ll = [] ;
		var m_sep = /^---*$/ ;
		var m_title = /^#(.*)/ ;
		var m_link = /^([u|d|l|r][0-9]*)?(<)?==?(?:\((.*)\))?==?(>)?([u|d|l|r][0-9]*)?\[([a-z0-9-_]+)\]([a-z])?$/i ;
		var m_ulink= /\?\[(.+)\](?:\(([^ ")]+)\s*(?:"(.+)")?\))?$/i ;
		var m_image = /\!\[(.+)\](?:\(([^ ")]+)\s*(?:"(.+)")?\))?/i ;

		var a ;
		b.title = null ;
		for(var i in b.bl) {
			var cl = b.bl[i] ;
			if(m_sep.exec(cl)) {
				if(ll.length>0) l.push( ll.join("<br/>")) ;
				ll = [] ;
			} else if(a = m_title.exec(cl)) {
				b.title = a[1] ;
			} else if( a=m_link.exec(cl)) {
				if(ll.length>0) l.push( ll.join("<br/>")) ;
				ll = [] ;
				var fp = "r" ;
				var tp = "l1" ;
				var ar = (a[2]!=undefined)?((a[4]!=undefined)?"b":"f"):((a[4]!=undefined)?"t":"") ;
				if(a[1]!=undefined) fp = a[1]
				if(a[5]!=undefined) tp = a[5] ;
				conn.push( {from:b.id,to:a[6],param:{s_pos:(fp+(l.length+((b.title!=null)?1:0))),e_pos:tp,cls:a[3],arrow:ar,type:a[7]}}) ;
			} else if(a = m_image.exec(cl)) {
				var im = ( `<img src="${a[2]}" title="${a[1]}" />`) ;
				if(a[3]!=undefined) {
					im = "<figure>"+im+"<figcaption>"+a[3]+"</figcaption></figure>" ;
				}
				ll.push(im) ;
			} else {
				m_b = /\*\*(.+?)\*\*/g　;
				while((m = m_b.exec(cl))!=null) {
					cl = cl.replace(m[0],"<strong>"+m[1]+"</strong>") ;
				}
				ll.push(cl) ;
			}
		}
		if(ll.length>0) l.push( ll.join("<br/>")) ;
//		console.log("class="+b.cls) ;
		if(l.length==1) l = l[0] ;
		box.push( {id:b.id,inner:l,pos:b.pos,cls:b.cls,title:b.title} ) ;
	}
	return {box:box,conn:conn} ;
}
this.upd_text = function(text) {
	var l = text.split("\n") ;
	for(var i in l) {
		var cl = l[i] ;
		var a ;
		if(cl=="") continue ;
		if(a = this.m_h.exec(cl)) {
			var pos = (this.bpos[a[1]]!=undefined)?this.bpos[a[1]]:{x:a[3],y:a[4]} ;
			l[i] = "["+a[1]+"]"+((a[2]!=undefined)?" ("+a[2]+")":"")+" <"+pos.x+","+pos.y+">" ;
		}
	}
	return l.join("\n") ;
}
}


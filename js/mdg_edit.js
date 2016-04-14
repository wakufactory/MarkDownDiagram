$(function() {
	var mag = 1.0 ;
	$('#base').css('width',"2000px").css('height',"2900px") ;

	$('#zoom').on("input",function() {
		mag = $(this).val()/100 ;
//		console.log(mag) ;
		$('#szoom').html("#base {transform: scale("+mag+")}");
	})	

	new resizebar('#rb','#edit',"v",1) ;
		
	var b = new mdg_draw($('#base')) ;
	var data = b.parse($('#source').val()) ;
	b.setobj(data) ;
	
	$('#source').on('keyup',function() {
		data = b.parse($(this).val()) ;
			b.setobj(data) ;
	})

	$(window).resize($('#base'),function() {
//		redraw(can,data.conn) ;
	})
	$(document).on("dragstart",'#base .box',function(ev){
		var oe = ev.originalEvent ;
		console.log("dstart") ;
		console.log(oe.pageX+"/"+oe.pageY);
		ev.originalEvent.dataTransfer.setData("text",$(this).attr('id')+"/"+oe.pageX+"/"+oe.pageY);
	})
	$('#base').on("dragenter dragover",function(){
		return false ;
	}).on("drop",function(ev){
		console.log("drop") ;
		var oe = ev.originalEvent ;
		var k = ev.originalEvent.dataTransfer.getData("text").split("/") ;
		var id = k[0] ;
		
		var ox = (oe.pageX-k[1])/mag ;
		var oy = (oe.pageY-k[2])/mag ;
//		console.log(ox+"/"+oy) ;
		var em = parseInt($('html').css('font-size')) ;

		var ex = parseInt($('#'+id).css("left")) ;
		var ey = parseInt($('#'+id).css("top")) ;
		var px = Math.floor(((ex+ox)/em+0.25)*2)/2 ;
		var py = Math.floor(((ey+oy)/em+0.25)*2)/2 ;

		b.setpos(id,px,py) ;
		b.redraw(data) ;
		$('#source').val(b.upd_text($('#source').val())) ;
		return false ;
	})
})


function resizebar(bar,target,hv,dir) {
	this.sw = 0 ;
	this.sel = target ;
	this.dir = dir ;
	this.hv = hv ;
	this.start = null ;
	this.attr = (hv=="v")?"width":"height" ;
	this.mouse = (hv=="v")?"pageX":"pageY" ;
	var self = this ;
	$(bar).on('mousedown touchstart',function(ev) {
		self.sw = parseInt($(self.sel).css(self.attr))-self.dir*ev.originalEvent[self.mouse] ;
		self.start = self.sel ;
	});
	$('body').on('mousemove touchmove',function(ev){
		if(self.start != self.sel) return true ;
		var w = self.dir*ev.originalEvent[self.mouse]+self.sw;
		if(w<100) return false ;
		$(self.sel).css(self.attr,w+"px") ;
		return false ;
	}).on('mouseup touchend',function() {
		self.start = null ;
	})
}
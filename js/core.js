/*!
 * Pedro's Behance webpage v0.1
 * http://behance.net/thefzn
 * http://github.com/thefzn
 *
 * Autor: Pedro Carrazco
 *
 * Date: 21/05/2014
 */
 
 "use strict";
var PB = {
	userID: "thefzn", // Default Behance User - Me
	api: "https://www.behance.net/v2/",
	key: "sSbSr1Gvrj1KLLWbgq3iKm9l3JLUlj3v",
	defErrorMsg: "The connection failed or this section is under construction, please try again later.",
	loading: "<img src='img/loading.gif' width='20' />",
	msgSize: 0,
	loadQueue: 0,
	user: {
		portfolio: {}
	},
	launch: function(){
		var self = this;
		if(typeof $ == "undefined"){
			return false;
		}
		this.userID = window.location.search || this.userID; 
		this.userID = this.userID.replace("?","");
		this.getProfile();
		$(window).on("resize",PB.resize);
		$("#loaderOverlay #loader").html(this.loading);
	},
	resize: function(){
		var limit = ($("body").height() * 0.6)-60,
			target = $("#Message .content .body"),
			slimscroll = target.parent().hasClass("slimScrollDiv"),
			finalSize = Math.min(PB.msgSize,limit);
		if(slimscroll){
			target.height(finalSize);
			target.parent().height(finalSize);
		}else{
			target.slimscroll({height:finalSize});
		}
		$("#Message").css("marginTop","-" + (($("#Message").height()/2) - 40) + "px");
		
		target = $("#Project .content .guide");
		slimscroll = target.parent().hasClass("slimScrollDiv");
		if(slimscroll){
			finalSize = $("body").height()-125;
			target.height(finalSize);
			target.parent().height(finalSize);
		}
		if(PB.user.portfolio instanceof PB.classes.Portfolio){
			PB.user.portfolio.resize();
		}
	},
	getProfile: function(data){
		var url = "users/" + this.userID,
			msg = "This is not the user you are looking for.",
			success = function (data) {
				PB.user = data.user;
				PB.fillData();
			};
		this.ajaxGet(url,msg,success);
	},
	getWork: function(){
		var url = "users/" + this.userID + "/work_experience",
			self = this,
			success = function (data) {
				PB.user.work=data.work_experience;
				if(PB.user.work.length > 0){
					PB.actions.openWork();
				}else{
					PB.actions.displayMsg("Sorry!",PB.defErrorMsg);
				}
			};
		if(typeof PB.user.work == "undefined"){
			this.ajaxGet(url,self.defErrorMsg,success);
		}else{
			$("#Menu").fadeOut(500);
			PB.actions.openWork();
		}
	},
	getPortfolio: function(sub){
		var url = "users/" + this.userID + "/projects",
			self = this,
			sub = sub || false,
			success = function (data) {
				var data = data || {},
					items = data.projects || PB.user.portfolio.items;
				if(items.length < 1){
					PB.actions.displayMsg("Sorry!",self.defErrorMsg);
				}else{
					PB.actions.openPorta(data,sub);
				}
				self = null;
			};
		if(PB.user.portfolio instanceof PB.classes.Portfolio){
			success();
		}else{
			this.ajaxGet(url,self.defErrorMsg,success);
		}
	},
	getProject: function(project,opener){
		var url = "projects/" + project ,
			self = this,
			success = function (data) {
				var data = data || false,
					project = data.project || data || false;
				if(!project){
					PB.actions.displayMsg("Sorry!",self.defErrorMsg);
				}else{
					if(project instanceof PB.classes.Project){
						opener.project.regenerate();
					}else{
						opener.project = new PB.classes.Project(project,"#Project");
					}
				}
				opener = null;
				self = null;
			};
		if(typeof opener.project != "undefined"){
			success(opener.project);
		}else{
			this.ajaxGet(url,self.defErrorMsg,success);
		}
	},
	ajaxGet: function(url,errorMsg,success){
		$("#Menu").fadeOut(500);
		$("#container #loaderOverlay").addClass("open");
		$.ajax({
			async: true,
			url: this.api + url + "?client_id=" + this.key + "&api_key=" + this.key,
			dataType: 'jsonp',
			method: "GET",
			timeout: 3000,
			error: function (jqXHR, textStatus, errorThrown) {
				//included so you can see any errors
				PB.actions.displayMsg("Sorry!",errorMsg);
				$("#container #loaderOverlay").removeClass("open");
			},
			success: function(data){
				success(data);
				$("#container #loaderOverlay").removeClass("open");
			}
		});
	},
	fillData: function(){
		var el, sec, img, data,
			self = this,
			menuIcn = $("#MenuIcon"),
			theUser = {
				name: this.user.display_name || this.userID,
				work: this.user.occupation || "",
				city: this.user.city || null,
				country:  this.user.country || null,
				add: ""
			};
		/* Profile Info */
		document.title = theUser.name + "'s Portfolio";
		el = $("#Profile");
		img = el.find(".profileImg");
		data = el.find(".profileData");
		theUser.add += (theUser.city) ? theUser.city : "";
		theUser.add += (theUser.city && theUser.country) ? ", " : "";
		theUser.add += (theUser.country) ? theUser.country : "";
		img.css("background-image","url("+this.user.images["50"]+")");
		data.find("h1").html(theUser.name);
		data.find("p").html(theUser.work + "<br />" + theUser.add );
		el.fadeIn(250);
		/* Navigation menu */
		el = $("#Menu");
		data = $("<ul id='basic'>");
		el.append(data);
		data.append("<li class='portfolio'>Portfolio</li>");
		data.append("<li class='contact'>Work Experience</li>");
		data.append("<li class='behance'><a href='http://www.behance.net/" + PB.userID + "' target='_blank'>Behance Portfolio</a></li>");
		if(!(PB.user.sections instanceof Array)){
			data = $("<ul id='sections'>");
			el.append(data);
			for(sec in this.user.sections){
				data.append("<li class='section'>" + sec + "</li>");
			}
		}
		$("#MenuIcon").addClass("closed");
		el.fadeIn(500);
		el.find("li").on("click",function(){
			var $el = $(this),
				nav = "";
			nav += $el.text();
			self.actions.nav.set(nav);
		});
		menuIcn.on("click",function (){PB.actions.nav.set()});
		PB.actions.nav.check();
	}
}
PB.actions = {
	backToMenu: function(){
		$("#Message,#Portfolio,#Filters").fadeOut(250,function(){
			$("#Menu").fadeIn(250)
		});
		$("#MenuIcon").addClass("closed");
		$("#Project").removeClass("open");
		if(typeof PB.user.portfolio != "undefined"){
			PB.user.portfolio.opened = false;
		}
	},
	openSection: function(s){
		var text = PB.user.sections[s] || false;
		
		$("#Menu").fadeOut(500,function(){
			if(text){
					PB.actions.displayMsg(s,text);
			}else{
				PB.actions.displayMsg("Sorry","Section not found");
			}
		});
	},
	openWork: function(){
		var data = PB.user.work,
			msg = "",
			i=0,
			len = data.length,
			title,timeStart,timeEnd,item;
		title = "Work Experience";
		
		for(;i<len;i++){
			item = data[i];
			msg += "<div>";
			msg += "<h2>" + item.position + "</h2>";
			msg += "At " + item.organization + " on " + item.location + "<br />";
			timeStart = item.start_date || false;
			timeEnd = (timeStart) ? item.end_date || "Present" : item.end_date || false;
			if(timeStart && timeEnd){
				msg += "(";
				msg += (timeStart) ? "from " + timeStart : "";
				msg += (timeEnd) ? " to " + timeEnd : "";
				msg += ")"
			}
			msg += "</div>";
		}
		msg += "";
		PB.actions.displayMsg(title,msg);
	},
	openPorta: function(data,sub){
		if(!(PB.user.portfolio)){
			PB.user.portfolio = new PB.classes.Portfolio(data.projects);
		}
		$("#Menu,#Message").fadeOut(500);
		$("#Portfolio,#Filters").fadeIn(500);
		$("#MenuIcon").removeClass("closed");
		if(!sub){
			PB.user.portfolio.resize();
		}else{
			PB.actions.searchProject(sub);
		}
	},
	openProject: function(project){
		if(!project.collection.opened){
			PB.actions.closeProject();
		}
		project.collection.circle.radius = project.collection.circle.radius * 3;
		project.collection.displayItems(true);
		project.collection.opened = true;
		$("#Filters").fadeOut(250);
		$("#Profile, #MenuIcon").addClass("closed");
		PB.getProject(project.data.id,project);
	},
	closeProject: function(){
		//$("#Filters").fadeIn(250);
		$("#Profile, #MenuIcon").removeClass("closed");
		$("#Project").removeClass("open");
		if(typeof PB.user.portfolio != "undefined"){
			PB.user.portfolio.opened = false;
			PB.user.portfolio.resize();
		}
	},
	searchProject: function(id){
		var port = PB.user.portfolio || false,
			items = port.items || [],
			i=0,
			len=items.length,
			found = false,
			itm;
		if(port){
			for(; i < len; i++){
				itm = items[i];
				if(itm.data.id == id){
					found = true;
					break;
				}
			}
			if(found){
				PB.actions.openProject(itm);
			}else{
				PB.actions.displayMsg("Sorry!","Project not found.");
			}
		}
	},
	displayMsg: function(header,text){
		var msg = $("#Message"),
			ico = $("#MenuIcon"),
			prof = $("#Profile"),
			port = $("#Portfolio,#Filters"),
			title,cont;
		header = header || false;
		text = text || "";
		
		title = (header) ? "<h1>" + header + "</h1>" : "";
		cont = "<div class='body'><div class='spacer'>" + text.replace(/\n/gi,"<br />") + "</div></div>";
		
		msg.find(".content").html(title + " " + cont);
		msg.fadeIn(500);
		port.fadeOut(250);
		this.closeProject();
		ico.removeClass("closed");
		prof.removeClass("closed")
		PB.msgSize = msg.find(".content .body").height();
		PB.resize();
	},
	imageLoaded: function(src){
		var target = $("#Project .content .guide"),
			newH;
		PB.loadQueue--;
		if(PB.loadQueue <= 0){
			var h = $("body").height()-125;
			$("#Project .content .guide,#Project .content .slimScrollDiv").height(h);
		}
	},
	nav: {
		path:[],
		prev: "",
		check: function(){
			var self = PB.actions.nav,
				hash = self.get();
			if(hash != self.prev){
				self.set(hash);
				self.go(hash);
			}
			setTimeout(PB.actions.nav.check,500);
		},
		set: function(path){
			path = (typeof path == "string") ? path : false;
			if (path){
				this.path = path.split("/");
				window.location.hash = "#/" + path;
			}else{
				this.path = [false];
				window.location.hash = "";
			}
		},
		get: function(){
			var hash = window.location.hash || "";
			hash = hash.replace("#/","");
			return hash || false;
		},
		go: function(){
			var s = this.path[0] || this.get(),
				sub = this.path[1] || false,
				proj;
			if(s){
				switch(s){
					case "Portfolio":
						if(!sub){
							PB.getPortfolio();
							PB.actions.closeProject();
						}else{
							proj = PB.getPortfolio(sub);
						}
					break;
					case "Work Experience":
						PB.getWork();
					break;
					case "Behance Portfolio":
						//window.open("http://www.behance.net/"+PB.userID);
						this.set();
					break;
					default:
						PB.actions.openSection(s)
				}
			}else{
				PB.actions.backToMenu();
			}
			this.prev = this.path.join("/");
		}
	}
}
PB.classes = {
	Drawable: function(){
		this.className = "drawable";
		this.el = "<div class='"+this.className+"'>";
		this.hasActions = false;
		this.draw = function(skip){
			var $el, $to;
			if(skip){
				return false;
			}
			this.$el = this.toJQ(this.el);
			$to = this.toJQ(this.container);
			this.$el.addClass(this.className);
			if(this.$el && $to){
				$to.append(this.$el);
			}
			this.drawn = true;
			$to = null;
		};
		this.toJQ = function(itm){
			var jItm = false;
			if(itm instanceof jQuery){
				jItm = itm;
			}else if(typeof itm == "string" || itm instanceof HTMLElement){
				jItm = $(itm);
			}
			itm = null;
			return jItm;
		};
		this.setPos = function(pos){
			if(pos instanceof Array){
				var x = pos[0] - (this.$el.width()/2 + parseInt(this.$el.css("padding-left"))),
					y = pos[1] - (this.$el.height()/2);
				this.pos = pos;
				this.$el.css("left", x + "px").css("top", y + "px");
			}
			this.fill();
			if(!this.hasActions){
				this.setActions();
				this.hasActions = false;
			}
		};
		this.fill = function(){ console.log("default fill action")};
		this.setActions = function(){
			var self = this;
			this.$el.addClass("visible");
			this.$el.click(function(){
				self.action();
			})
		};
	},
	Item: function(name){
		this.className = name.toLowerCase() + "Item";
		this.container = "";
		this.collection = null;
		this.data = null;
		this.visible = true;
		this.open = false;
		this.$el = {};
		this.pos = [0,0];
		this.init = function(data,collection){
			this.collection = collection;
			this.data = data;
			this.container = (typeof this.collection == "object") ? this.collection.container + " ." + this.collection.className : this.collection;
		}
		this.action = function(){};
	},
	Collection: function(name,radial){
		this.className = name.toLowerCase();
		this.container = "#" + this.className[0].toUpperCase() + this.className.substr(1);
		this.radial = radial || false;
		this.opened = false;
		this.circle = {
			radius: 150,
			items:0,
			angleStep:0
		};
		this.items = [];
		this.$el = {};
		this.genItems = function(data){
			var i = 0,
				len = data.length,
				filters = [],
				j,len2,itm,tags;
			for( ; i < len ; i++){
				itm = data[i];
				tags = itm.fields;
				if(typeof itm.fields != "undefined"){
					for(j = 0, len2 = tags.length ; j < len2 ; j++){
						filters.push(tags[j]);
					}
					this.items.push(new PB.classes.PortfolioItem(itm,this));
				}else{
					if(typeof this.items[itm] == "undefined"){
						this.items[itm] = new PB.classes.FiltersItem(itm,this);
					}
				}
			}
			this.handleData(filters,len);
			this.displayItems();
		};
		this.handleData = function(){};
		this.countVisible = function(){
			var i = 0,
				len = 0,
				count = 0,
				itm;
			len = this.items.length;
			for(;i<len;i++){
				itm = this.items[i];
				count = (itm.checkVisible()) ? count + 1 : count;
			}
			return count;
		};
		this.displayItems = function(noDraw){
			var i = 0,
				len = 0,
				count = 0,
				noDraw = noDraw || false,
				itm;
			len = this.items.length;
			if(len > 0){
				for(;i<len;i++){
					itm = this.items[i];
					count += (this.eachItem(itm,noDraw,count)) ? 1 : 0;
				}
			}else{
				for(i in this.items){
					itm = this.items[i];
					count += (this.eachItem(itm,noDraw,count)) ? 1 : 0;
				}
			}
		};
		this.eachItem = function(itm,noDraw,count){
			var pos,a;
			if(itm.visible){
				if(this.radial){
					a = (this.circle.angleStep * count) * (Math.PI / 180);
					pos = [];
					pos[0] = this.circle.radius * Math.cos(a);
					pos[1] = this.circle.radius * Math.sin(a);
				}
				if(!noDraw){
					itm.draw();
				}
				itm.setPos(pos);
				return true;
			}
			return false;
		};
		this.resize = function(){
			this.reCalculate();
			this.displayItems(true);
		};
		this.reCalculate = function(len,container){
			var container = container || "body",
				rel = 2.8,
				bodyWidth = this.toJQ(container).width(),
				bodyHeight = this.toJQ(container).height(),
				len = len || false;
			this.circle.items = len || this.circle.items;
			this.circle.angleStep = 360 / this.circle.items;
			this.circle.radius = Math.min(bodyWidth/rel,(bodyHeight - 150)/rel,180);
			this.circle.radius = (this.opened) ? Math.max(bodyWidth,bodyHeight) * 1.5 : this.circle.radius;
		};
		this.init = function(data,err){
			var err = err || false;
			if(!(data instanceof Array)){
				console.log("Data must be an Array");
				if(err){
					PB.actions.displayMsg("Sorry!","Data not found... Please try again later.");
				}
				return false;
			}
			if(this.radial){
				this.reCalculate(data.length);
			}
			this.draw();
			this.genItems(data);
		};
	},
	PortfolioItem: function(data,collection){
		this.checkVisible = function(){
			var i = 0,
				f = this.data.fields,
				len = f.length;
			this.visible = false;
			for( ; i < len ; i++){
				if(this.collection.filters.items[f[i]].visible){
					this.visible = true;
					break;
				}
			}
			if(this.visible){
				this.$el.addClass("visible");
			}else{
				this.$el.removeClass("visible");
			}
			return this.visible;
		};
		this.fill = function(){
			this.$el.html("<img src='" + this.data.covers[115] + "' width='" + this.$el.css("width") + "' height='" + this.$el.css("height") + "' />");
		};
		this.action = function(){
			PB.actions.nav.set("Portfolio/"+this.data.id);
		};
		this.init(data,collection);
	},
	Portfolio: function(data){
		this.filters = {};
		this.handleData = function(filters,len){
			if(!(this.filters instanceof PB.classes.Filters)){
				this.filters = new PB.classes.Filters(filters);
				this.circle.items = len;
			}
		};
		this.applyFilters = function(){
			this.circle.items = this.countVisible();
			this.reCalculate();
			this.displayItems(true);
		};
		this.init(data,true);
	},
	FiltersItem: function(data, collection){
		this.fill = function(){
			this.$el.html(this.data + "<span class='state'></span>");
		};
		this.action = function(){
			this.visible = (this.visible) ? false : true;
			this.$el.toggleClass("visible");
			PB.user.portfolio.applyFilters();
		}
		this.init(data,collection);
	},
	Filters: function(data){
		this.init(data);
	},
	Project: function(data, collection){
		this.fill = function(){
			var html = "",
				pjt = this.data || {modules:[]},
				mods = pjt.modules || [],
				i = 0,
				len = mods.length,
				styles = this.data.styles,
				sCaption = "",
				header = "",
				mod,w,img,cont;
			if(!(this.closeBtn instanceof jQuery)){
				this.closeBtn = $("<div id='close'>");
			}
			this.closeBtn.on("click",function(){
				PB.actions.nav.set("Portfolio");
			});
			header += "<div class='projectTitle'>";
			header += "<div class='projectImg' style='background-image:url(" + pjt.covers[115] + ");'></div>";
			header += "<div class='projectData'>";
			header += "<h1 class='title'>" + pjt.name + "</h1>" + "<p>" + pjt.description + "</p>"
			header += "</div></div>"
			PB.loadQueue = 0;
			html += "<div class='content'><div class='guide'>";
			for(; i < len; i++){
				mod = pjt.modules[i];
				if(mod.type == "text"){
					html += mod.text;
				}else if(mod.type == "image"){
					w = Math.min(parseInt(mod.width),($("body").width()-30));
					sCaption = mod.caption_plain || false;
					PB.loadQueue++;
					img = new Image();
					img.onload = function(){setTimeout(PB.actions.imageLoaded(),100);};
					img.src = mod.src;
					img.width = w;
					html += "<div class='main-image'>";
					html += img.outerHTML;
					html += (sCaption) ? "<span class='caption'>" + sCaption + "</span>" : "";
					html += "</div>";
				}
			}
			html += "</div></div>";
			this.$el.prepend(this.closeBtn);
			this.$el.append(header);
			this.$el.append(html);
			this.applyStyles(pjt.styles);
			var h = $("body").height()-125;
			$("#Project .content .guide").slimscroll({height:h});
			html = null;
			img = null;
			w = null;
			PB.resize();
		};
		this.init(data,collection);
		this.regenerate = function(){
			$(this.container).empty();
			this.draw();
			this.fill();
			$("#Project").addClass("open");
		};
		this.applyStyles = function(styles){
			var styles = styles || {},
				text = styles.text || {},
				back = styles.background || {},
				p = this.formatStyles(text.paragraph) || {},
				a = this.formatStyles(text.link) || {},
				sub = this.formatStyles(text.subtitle) || {},
				tit = this.formatStyles(text.title) || {},
				cap = this.formatStyles(text.caption) || {},
				c = "#" + back.color;
			
			this.$el.find(".content p").css(p);
			this.$el.find(".content a").css(a);
			this.$el.find(".content .sub-title").css(sub);
			this.$el.find(".content .title").css(tit);
			this.$el.find(".content .caption").css(cap);
			this.$el.find(".content").css(p);
			
			this.$el.css("background-color",c);
			
		};
		this.formatStyles = function(o){
			var target = o || false,
				temp = {},
				n,nAlt,i,j,nAr,len;
			if(!target){
				return false;
			}
			for(n in target){
				i = n.indexOf("_")
				if(i >= 0){
					nAr = n.split("_");
					nAlt = nAr[0];
					for(j = 1, len = nAr.length; j < len; j++){
						nAlt += nAr[j].charAt(0).toUpperCase() + nAr[j].substr(1);
					}
					temp[nAlt] = target[n];
				}else{
					temp[n] = target[n];
				}
			}
			return temp;
		}
		this.regenerate();
	}
}
PB.classes.Collection.prototype = new PB.classes.Drawable();
PB.classes.Item.prototype = new PB.classes.Drawable();
PB.classes.PortfolioItem.prototype = new PB.classes.Item("Portfolio");
PB.classes.FiltersItem.prototype = new PB.classes.Item("Filters");
PB.classes.Project.prototype = new PB.classes.Item("Project");
PB.classes.Portfolio.prototype = new PB.classes.Collection("Portfolio",true);
PB.classes.Filters.prototype = new PB.classes.Collection("Filters");

$(window).load(function(){
	PB.launch();
})

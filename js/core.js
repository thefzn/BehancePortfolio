/*!
 * Pedro's Behance webpage v0.1
 * http://behance.net/thefzn
 * http://github.com/thefzn
 *
 * Autor: Pedro Carrazco
 *
 * Date: 21/05/2014
 */
 
PB = {
	userID: "thefzn", // Default Behance User - Me
	api: "https://www.behance.net/v2/",
	key: "sSbSr1Gvrj1KLLWbgq3iKm9l3JLUlj3v",
	user: {
		portfolio: {}
	},
	launch: function(){
		if(typeof $ == "undefined"){
			return false;
		}
		this.userID = window.location.search || this.userID; 
		this.userID = this.userID.replace("?","");
		this.getProfile();
		$(window).on("resize",PB.resize);
	},
	resize: function(){
		var limit = $("body").height() - ($("body").height()/5 + 157),
			target = $("#Message .content .body"),
			slimscroll = target.parent().hasClass("slimScrollDiv");
		target = (slimscroll) ? target.parent() : target;
		
		if(target.height() >= (limit-10)){
			if(slimscroll){
				target.css("height", limit + "px");
			}else{
				target.slimscroll(limit);
			}
		}else{
			target.css("height","auto");
		}
		
		if(PB.user.portfolio instanceof PB.classes.Portfolio){
			PB.user.portfolio.resize();
		}
	},
	getProfile: function(data){
		var url = "users/" + this.userID + "?api_key=",
			msg = "The user you are looking for doesn't exist.",
			success = function (data) {
				PB.user = data.user;
				PB.fillData();
			};
		this.ajaxGet(url,msg,success);
	},
	getWork: function(){
		var url = "users/" + this.userID + "/work_experience?client_id=",
			msg = "This section is under construction, please try again later.",
			success = function (data) {
				PB.user.work=data.work_experience;
				PB.actions.openWork();
			};
		if(typeof PB.user.work == "undefined"){
			this.ajaxGet(url,msg,success);
		}else{
			$("#Menu").fadeOut(500);
			PB.actions.openWork();
		}
	},
	getPortfolio: function(){
		var url = "users/" + this.userID + "/projects?client_id=",
			msg = "The connection failed or this section is under construction, please try again later.",
			success = function (data) {
				if(data.projects.length < 1){
					PB.actions.displayMsg("Warning!",msg);
				}else{
					PB.actions.openPorta(data);
				}
			};
		if(PB.user.portfolio instanceof PB.classes.Portfolio){
			if(PB.user.portfolio.items.length < 1){
				PB.actions.displayMsg("Warning!",msg);
			}else{
				$("#Menu").fadeOut(500,function(){
					PB.user.portfolio.draw(true);
					PB.user.portfolio.resize();
					$("#Portfolio").fadeIn(250);
					$("#Filters").fadeIn(250);
					$("#MenuIcon").fadeIn(500);
				});
			}
			
		}else{
			this.ajaxGet(url,msg,success);
		}
	},
	ajaxGet: function(url,errorMsg,success){
		$("#Menu").fadeOut(500);
		$.ajax({
			async: true,
			url: this.api + url + this.key,
			dataType: 'jsonp',
			method: "GET",
			timeout: 3000,
			error: function (jqXHR, textStatus, errorThrown) {
				//included so you can see any errors
				PB.actions.displayMsg("Warning!",errorMsg);
			},
			success: success
		});
	},
	fillData: function(){
		var el, sec, img, data,
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
		data.append("<li class='behance'>Behance Portfolio</li>");
		if(!(PB.user.sections instanceof Array)){
			data = $("<ul id='sections'>");
			el.append(data);
			for(sec in this.user.sections){
				data.append("<li class='section'>" + sec + "</li>");
			}
		}
		el.fadeIn(500);
		el.find("li").on("click",this.actions.menuClick);
		menuIcn.on("click",function(){
			$("#Message,#Portfolio,#Filters").fadeOut(250,function(){
				$("#Menu").fadeIn(250)
			});
			$(this).fadeOut(250);
		});
	}
}
PB.actions = {
	menuClick: function(){
		var el = $(this);
		if(el.hasClass("section")){
			PB.actions.openSection(el);
		}else{
			switch(el.text()){
				case "Portfolio":
					PB.getPortfolio();
				break;
				case "Work Experience":
					PB.getWork();
				break;
				default:
					window.open("http://www.behance.net/"+PB.userID);
				break;
			}
		}
	},
	openSection: function(el){
		var text = PB.user.sections[el.text()];
		
		$("#Menu").fadeOut(500,function(){
			PB.actions.displayMsg(el.text(),text);
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
			timeEnd = item.end_date || false;
			msg += "(";
			msg += (timeStart) ? "from " + timeStart : "";
			msg += (timeEnd) ? " to " + timeStart : "";
			msg += ")"
			msg += "</div>";
		}
		msg += "";
		PB.actions.displayMsg(title,msg);
	},
	openPorta: function(data){
		PB.user.portfolio = new PB.classes.Portfolio(data.projects);
		$("#Portfolio").fadeIn(250);
		$("#Filters").fadeIn(250);
		$("#MenuIcon").fadeIn(500);
	},
	displayMsg: function(header,text){
		var msg = $("#Message"),
			ico = $("#MenuIcon"),
			title,cont;
		header = header || false;
		text = text || "";
		
		title = (header) ? "<h1>" + header + "</h1>" : "";
		cont = "<div class='body'>" + text.replace(/\n/gi,"<br />") + "</div>";
		
		msg.find(".content").html(title + " " + cont);
		msg.fadeIn(500);
		ico.fadeIn(250);
		PB.resize();
	}
}
PB.classes = {
	Drawable: function(){
		this.className = "drawable";
		this.el = "<div class='"+this.className+"'>";
		this.hasActions = false;
		this.draw = function(skip){
			var $el, $to;
			this.$el = this.toJQ(this.el);
			$to = this.toJQ(this.container);
			this.$el.addClass(this.className);
			if(this.$el && $to){
				$to.append(this.$el);
			}
			this.drawn = true;
			to = null;
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
		this.$el = {};
		this.pos = [0,0];
		this.init = function(data,collection){
			this.collection = collection;
			this.data = data;
			this.container = this.collection.container + " ." + this.collection.className;
		}
		this.action = function(){};
	},
	Collection: function(name,radial){
		this.className = name.toLowerCase();
		this.container = "#" + this.className[0].toUpperCase() + this.className.substr(1);
		this.radial = radial || false;
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
				bodyWidth = this.toJQ(container).width() / 2.8,
				bodyHeight = (this.toJQ(container).height() - 150) / 2.8,
				len = len || false;
			this.circle.items = len || this.circle.items;
			this.circle.angleStep = 360 / this.circle.items;
			this.circle.radius = Math.min(bodyWidth,bodyHeight,180);
		};
		this.init = function(data,err){
			var err = err || false;
			if(!(data instanceof Array)){
				console.log("Data must be an Array");
				if(err){
					PB.actions.displayMsg("Warning!","Data not found... Please try again later.");
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
				f = this.data.fields
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
		this.init(data,collection);
	},
	Portfolio: function(data){
		this.filters = {};
		this.handleData = function(filters,len){
			this.filters = new PB.classes.Filters(filters);
			this.circle.items = len;
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
	}
}
PB.classes.Collection.prototype = new PB.classes.Drawable();
PB.classes.Item.prototype = new PB.classes.Drawable();
PB.classes.PortfolioItem.prototype = new PB.classes.Item("Portfolio");
PB.classes.FiltersItem.prototype = new PB.classes.Item("Filters");
PB.classes.Portfolio.prototype = new PB.classes.Collection("Portfolio",true);
PB.classes.Filters.prototype = new PB.classes.Collection("Filters");

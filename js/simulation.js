/*
 * Copyright 2011 Tom Skazinski
 * 
 * This file is part of the Alpha Zemerge Micro Economy (AZME) Simulation.
 * 
 * AZME is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * AZME is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with Foobar. If not, see http://www.gnu.org/licenses/.
 * 
 */

//function to detect canvas support by alterebro (http://code.google.com/p/browser-canvas-support/)
var canvas_support = {
	canvas_compatible : false,
	check_canvas : function() {
		try {
			this.canvas_compatible = !!(document.createElement('canvas').getContext('2d')); // S60
			} catch(e) {
			this.canvas_compatible = !!(document.createElement('canvas').getContext); // IE
		} 
		return this.canvas_compatible;
	}
} 

function addCommas(num)
{
	num += '';
	x = num.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function generateHome(id,netassets,cash,income,numpeople)
{
	document.write("<div class='az_home'>");
		document.write("<canvas id='home_canvas_" + id + "' width='88' height='100'>");
				document.write("<p>This browser does not support HTML5.</p>");
		document.write("</canvas>");
		document.write("<p>Home #" + id + "</p>");
		document.write("<p>Net Assets: $<strong>" + addCommas(netassets) + "</strong></p>");
		document.write("<p>Cash: $<strong>" + addCommas(cash) + "</strong></p>");
		document.write("<p>Income: $" + addCommas(income) + "</p>");
		document.write("<p>People: " + numpeople + "</p>");
	document.write("</div>");	
}

function generateBusiness(id,netassets,cash,income,numemp,invcap)
{
	document.write("<div class='az_business'>");
		document.write("<canvas id='business_canvas_" + id + "' width='88' height='100'>");
				document.write("<p>This browser does not support HTML5.</p>");
		document.write("</canvas>");
		document.write("<p>Business #" + id + "</p>");
		document.write("<p>Net Assets: $<strong>" + addCommas(netassets) + "</strong></p>");
		document.write("<p>Cash: $<strong>" + addCommas(cash) + "</strong></p>");
		document.write("<p>Income: $" + addCommas(income) + "</p>");
		document.write("<p># Employees: " + numemp + "</p>");
		document.write("<p>Inv/Cap: $" + addCommas(invcap) + "</p>");
	document.write("</div>");
}

function generateBank(netassets,deposits,curloans,avaloans)
{
	document.write("<div class='az_bank'>");
		document.write("<canvas id='bank_canvas' width='88' height='100'>");
				document.write("<p>This browser does not support HTML5.</p>");
		document.write("</canvas>");
		document.write("<p>Bank</p>");
		document.write("<p>Net Assets: $<strong>" + addCommas(netassets) + "</strong></p>");
		document.write("<p>Current Deposits: $<strong>" + addCommas(deposits) + "</strong></p>");
		document.write("<p>Current Loans: $<strong>" + addCommas(curloans) + "</strong></p>");
		document.write("<p>Available Loans: $<strong>" + addCommas(avaloans) + "</strong></p>");
	document.write("</div>");
}

function generateGov(netassets,cash,numemp,taxcollected)
{
	document.write("<div class='az_gov'>");
		document.write("<canvas id='gov_canvas' width='88' height='100'>");
				document.write("<p>This browser does not support HTML5.</p>");
		document.write("</canvas>");
		document.write("<p>Government</p>");
		document.write("<p>Net Assets: $<strong>" + addCommas(netassets) + "</strong></p>");
		document.write("<p>Cash: $<strong>" + addCommas(cash) + "</strong></p>");
		document.write("<p># Employees: " + numemp + "</p>");
		document.write("<p>Tax Collected: $" + addCommas(taxcollected) + "</p>");
	document.write("</div>");
}

// assuming week,month,year ranges from -1 to 1
function drawHome(id,scale,week,month,year)
{
	var increase_week_color = "#00FF00";
	var decrease_week_color = "#FF0000";	
	var increase_month_color = "#00FF00";
	var decrease_month_color = "#FF0000";	
	var increase_year_color = "#00FF00";
	var decrease_year_color = "#FF0000";	
	
	if (week>1){week = 1;increase_week_color="#00B300"}
	if (month>1){month = 1;increase_month_color="#00B300"}
	if (year>1){year = 1;increase_year_color="#00B300"}

	if (week<-0.5){week = -0.5;decrease_week_color="#B30000"}
	if (month<-0.5){month = -0.5;decrease_month_color="#B30000"}
	if (year<-0.5){year = -0.5;decrease_year_color="#B30000"}
	
    var ctx = document.getElementById('home_canvas_'+id).getContext('2d');
    var home_img = new Image();
    home_img.onload = function(){
    	
    	if (scale < 0.01)
    	{
    		scale = 0.01;
    	}
    	if (scale > 10)
    	{
    		scale = 10;
    	}

    	// calculate image size
    	var x = home_img.width;
    	var y = home_img.height;
    	
    	var scaled_x = x * scale;
    	var scaled_y = y * scale;
    	
    	var offset_x = (x-scaled_x)/2;
    	var offset_y = (y-scaled_y)/2;
    	
		ctx.drawImage(home_img,offset_x,offset_y,scaled_x,scaled_y);
					
		// draw the stat bars
		ctx.strokeStyle = "#8A8A8A";
		ctx.strokeRect(5,70,80,5);
		ctx.strokeRect(5,80,80,5);
		ctx.strokeRect(5,90,80,5);
		
		/*ctx.translate(5, 15);
		ctx.fillStyle = "Blue";
		ctx.mozDrawText(scale);	*/
		
		ctx.fillStyle = increase_week_color;
		if (week>0)
		{
			ctx.fillRect(45,70,week*40,5);
		}
		ctx.fillStyle = increase_month_color;
		if (month>0)
		{		
			ctx.fillRect(45,80,month*40,5);
		}
		ctx.fillStyle = increase_year_color;
		if (year>0)
		{
			ctx.fillRect(45,90,year*40,5);
		}
		
		ctx.fillStyle = decrease_week_color;
		if (week<0)
		{
			ctx.fillRect(45,70,week*80,5);
		}
		ctx.fillStyle = decrease_month_color;
		if (month<0)
		{
			ctx.fillRect(45,80,month*80,5);
		}
		ctx.fillStyle = decrease_year_color;
		if (year<0)
		{
			ctx.fillRect(45,90,year*80,5);
		}

	};
	home_img.src = 'images/simulation/Home.png';
}

function drawBusiness(id,scale,week,month,year)
{
	var increase_week_color = "#00FF00";
	var decrease_week_color = "#FF0000";	
	var increase_month_color = "#00FF00";
	var decrease_month_color = "#FF0000";	
	var increase_year_color = "#00FF00";
	var decrease_year_color = "#FF0000";	
	
	if (week>1){week = 1;increase_week_color="#00B300"}
	if (month>1){month = 1;increase_month_color="#00B300"}
	if (year>1){year = 1;increase_year_color="#00B300"}

	if (week<-0.5){week = -0.5;decrease_week_color="#B30000"}
	if (month<-0.5){month = -0.5;decrease_month_color="#B30000"}
	if (year<-0.5){year = -0.5;decrease_year_color="#B30000"}
	
    var ctx = document.getElementById('business_canvas_'+id).getContext('2d');
    var business_img = new Image();
    business_img.onload = function(){
    	
    	if (scale < 0.01)
    	{
    		scale = 0.01;
    	}
    	if (scale > 10)
    	{
    		scale = 10;
    	}
    	
    	var x = business_img.width;
    	var y = business_img.height;
    	
    	var scaled_x = x * scale;
    	var scaled_y = y * scale;
    	
    	var offset_x = (x-scaled_x)/2;
    	var offset_y = (y-scaled_y)/2;
    	
		ctx.drawImage(business_img,offset_x,offset_y,scaled_x,scaled_y);
					
		// draw the stat bars
		ctx.strokeStyle = "#8A8A8A";
		ctx.strokeRect(5,70,80,5);
		ctx.strokeRect(5,80,80,5);
		ctx.strokeRect(5,90,80,5);
		
		/*ctx.translate(5, 15);
		ctx.fillStyle = "Red";
		ctx.mozDrawText(scale);*/
		
		ctx.fillStyle = increase_week_color;
		if (week>0)
		{
			ctx.fillRect(45,70,week*40,5);
		}
		ctx.fillStyle = increase_month_color;
		if (month>0)
		{		
			ctx.fillRect(45,80,month*40,5);
		}
		ctx.fillStyle = increase_year_color;
		if (year>0)
		{
			ctx.fillRect(45,90,year*40,5);
		}
		
		ctx.fillStyle = decrease_week_color;
		if (week<0)
		{
			ctx.fillRect(45,70,week*80,5);
		}
		ctx.fillStyle = decrease_month_color;
		if (month<0)
		{
			ctx.fillRect(45,80,month*80,5);
		}
		ctx.fillStyle = decrease_year_color;
		if (year<0)
		{
			ctx.fillRect(45,90,year*80,5);
		}
    };
	business_img.src = 'images/simulation/Business.png';
}

function drawBank(week,month,year)
{
	var increase_week_color = "#00FF00";
	var decrease_week_color = "#FF0000";	
	var increase_month_color = "#00FF00";
	var decrease_month_color = "#FF0000";	
	var increase_year_color = "#00FF00";
	var decrease_year_color = "#FF0000";	
	
	if (week>1){week = 1;increase_week_color="#00B300"}
	if (month>1){month = 1;increase_month_color="#00B300"}
	if (year>1){year = 1;increase_year_color="#00B300"}

	if (week<-0.5){week = -0.5;decrease_week_color="#B30000"}
	if (month<-0.5){month = -0.5;decrease_month_color="#B30000"}
	if (year<-0.5){year = -0.5;decrease_year_color="#B30000"}

    var ctx = document.getElementById('bank_canvas').getContext('2d');
    var bank_img = new Image();
    bank_img.onload = function(){
    	
    	var x = bank_img.width;
    	var y = bank_img.height;
    	
    	var scaled_x = x * 1;
    	var scaled_y = y * 1;
    	
    	var offset_x = (x-scaled_x)/2;
    	var offset_y = (y-scaled_y)/2;
    	
		ctx.drawImage(bank_img,offset_x,offset_y,scaled_x,scaled_y);
		/*
		// draw the stat bars
		ctx.strokeStyle = "#8A8A8A";
		ctx.strokeRect(5,70,80,5);
		ctx.strokeRect(5,80,80,5);
		ctx.strokeRect(5,90,80,5);
		
		ctx.fillStyle = increase_week_color;
		if (week>0)
		{
			ctx.fillRect(45,70,week*40,5);
		}
		ctx.fillStyle = increase_month_color;
		if (month>0)
		{		
			ctx.fillRect(45,80,month*40,5);
		}
		ctx.fillStyle = increase_year_color;
		if (year>0)
		{
			ctx.fillRect(45,90,year*40,5);
		}
		
		ctx.fillStyle = decrease_week_color;
		if (week<0)
		{
			ctx.fillRect(45,70,week*80,5);
		}
		ctx.fillStyle = decrease_month_color;
		if (month<0)
		{
			ctx.fillRect(45,80,month*80,5);
		}
		ctx.fillStyle = decrease_year_color;
		if (year<0)
		{
			ctx.fillRect(45,90,year*80,5);
		}*/
    };
	bank_img.src = 'images/simulation/Bank.png';
}

function drawGov(week,month,year)
{
	var increase_week_color = "#00FF00";
	var decrease_week_color = "#FF0000";	
	var increase_month_color = "#00FF00";
	var decrease_month_color = "#FF0000";	
	var increase_year_color = "#00FF00";
	var decrease_year_color = "#FF0000";	
	
	if (week>1){week = 1;increase_week_color="#00B300"}
	if (month>1){month = 1;increase_month_color="#00B300"}
	if (year>1){year = 1;increase_year_color="#00B300"}

	if (week<-0.5){week = -0.5;decrease_week_color="#B30000"}
	if (month<-0.5){month = -0.5;decrease_month_color="#B30000"}
	if (year<-0.5){year = -0.5;decrease_year_color="#B30000"}
	
    var ctx = document.getElementById('gov_canvas').getContext('2d');
    var gov_img = new Image();
    gov_img.onload = function(){
    	
    	var x = gov_img.width;
    	var y = gov_img.height;
    	
    	var scaled_x = x * 1;
    	var scaled_y = y * 1;
    	
    	var offset_x = (x-scaled_x)/2;
    	var offset_y = (y-scaled_y)/2;
    	
		ctx.drawImage(gov_img,offset_x,offset_y,scaled_x,scaled_y);
		/*
		// draw the stat bars
		ctx.strokeStyle = "#8A8A8A";
		ctx.strokeRect(5,70,80,5);
		ctx.strokeRect(5,80,80,5);
		ctx.strokeRect(5,90,80,5);
		
		ctx.fillStyle = increase_week_color;
		if (week>0)
		{
			ctx.fillRect(45,70,week*40,5);
		}
		ctx.fillStyle = increase_month_color;
		if (month>0)
		{		
			ctx.fillRect(45,80,month*40,5);
		}
		ctx.fillStyle = increase_year_color;
		if (year>0)
		{
			ctx.fillRect(45,90,year*40,5);
		}
		
		ctx.fillStyle = decrease_week_color;
		if (week<0)
		{
			ctx.fillRect(45,70,week*80,5);
		}
		ctx.fillStyle = decrease_month_color;
		if (month<0)
		{
			ctx.fillRect(45,80,month*80,5);
		}
		ctx.fillStyle = decrease_year_color;
		if (year<0)
		{
			ctx.fillRect(45,90,year*80,5);
		}*/
    };
	gov_img.src = 'images/simulation/Gov.png';
}

$(document).ready(function () {
	if(!canvas_support.check_canvas()){  //check canvas
		alert('This Browser does not support canvas elements.');
	}
});

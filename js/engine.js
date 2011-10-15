/*
 *
 * engine.js 
 *
 * Copyright 2011 Tom Skazinski <tom.skazinski@gmail.com>
 * 
 * This file is part of the Alpha Zemerge Micro Economy (AZME) Simulation.
 * 
 * AZME is free software: you can redistribute it and/or modify it under the 
 * terms of the GNU General Public License as published by the Free Software 
 * Foundation, either version 3 of the License, or (at your option) any later 
 * version.
 * 
 * AZME is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more 
 * details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with AZME. If not, see http://www.gnu.org/licenses/.
 * 
 */

function nextDay()
{
	var currentDay = parseInt(localStorage["az.simdateDay"]);
	var currentMonth = parseInt(localStorage["az.simdateMonth"]);
	var currentYear = parseInt(localStorage["az.simdateYear"]);

	currentDay++;
	
	calculateDay();
	
	if (currentDay == 31)
	{
		currentDay = 1;
		currentMonth++;
	}
	if (currentMonth == 13)
	{
		currentMonth = 1;
		currentDay = 1;
		currentYear++;
	}

	updateHistory(currentDay,currentMonth,currentYear);
	
	localStorage["az.simdateDay"] = currentDay;
	localStorage["az.simdateMonth"] = currentMonth;
	localStorage["az.simdateYear"] = currentYear;
	
	$('#simdate_day').html(localStorage["az.simdateDay"]);
	$('#simdate_month').html(localStorage["az.simdateMonth"]);
	$('#simdate_year').html(localStorage["az.simdateYear"]);
	
	redrawFrontEnd();
}

function nextWeek()
{
	var currentDay = parseInt(localStorage["az.simdateDay"]);
	var currentMonth = parseInt(localStorage["az.simdateMonth"]);
	var currentYear = parseInt(localStorage["az.simdateYear"]);

	for (var i=0;i<7;i++)
	{
		currentDay++;
		calculateDay();
		
		if (currentDay == 31)
		{
			currentDay = 1;
			currentMonth++;
		}
		if (currentMonth == 13)
		{
			currentMonth = 1;
			currentDay = 1;
			currentYear++;
		}

		updateHistory(currentDay,currentMonth,currentYear);
	}
	
	localStorage["az.simdateDay"] = currentDay;
	localStorage["az.simdateMonth"] = currentMonth;
	localStorage["az.simdateYear"] = currentYear;
	
	$('#simdate_day').html(localStorage["az.simdateDay"]);
	$('#simdate_month').html(localStorage["az.simdateMonth"]);
	$('#simdate_year').html(localStorage["az.simdateYear"]);
	
	redrawFrontEnd();
}

function nextMonth()
{
	var currentDay = parseInt(localStorage["az.simdateDay"]);
	var currentMonth = parseInt(localStorage["az.simdateMonth"]);
	var currentYear = parseInt(localStorage["az.simdateYear"]);

	for (var i=0;i<30;i++)
	{
		currentDay++;
		calculateDay();
		
		if (currentDay == 31)
		{
			currentDay = 1;
			currentMonth++;
		}
		if (currentMonth == 13)
		{
			currentMonth = 1;
			currentDay = 1;
			currentYear++;
		}
		
		updateHistory(currentDay,currentMonth,currentYear);
	}
	
	localStorage["az.simdateDay"] = currentDay;
	localStorage["az.simdateMonth"] = currentMonth;
	localStorage["az.simdateYear"] = currentYear;
	
	$('#simdate_day').html(localStorage["az.simdateDay"]);
	$('#simdate_month').html(localStorage["az.simdateMonth"]);
	$('#simdate_year').html(localStorage["az.simdateYear"]);
	
	redrawFrontEnd();
}

function updateHistory(currentDay,currentMonth,currentYear)
{
	if (currentDay%7==1)
	{
		for (var i=1;i<=parseInt(localStorage["az.householdCount"]);i++)
		{
			localStorage["az.household." + i + ".netassetsHistory.week"] = localStorage["az.household." + i + ".netassets"];
		}
		for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
		{
			if (checkBusinessActiveStatus(i))
			{
				localStorage["az.business." + i + ".netassetsHistory.week"] = localStorage["az.business." + i + ".netassets"];
			}
		}
	}
	if (currentDay==1)
	{
		for (var i=1;i<=parseInt(localStorage["az.householdCount"]);i++)
		{
			localStorage["az.household." + i + ".netassetsHistory.month"] = localStorage["az.household." + i + ".netassets"];
		}
		for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
		{
			if (checkBusinessActiveStatus(i))
			{
				localStorage["az.business." + i + ".netassetsHistory.month"] = localStorage["az.business." + i + ".netassets"];
			}
		}
	}

	if (currentMonth==1)
	{
		for (var i=1;i<=parseInt(localStorage["az.householdCount"]);i++)
		{
			localStorage["az.household." + i + ".netassetsHistory.year"] = localStorage["az.household." + i + ".netassets"];
		}
		for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
		{
			if (checkBusinessActiveStatus(i))
			{
				localStorage["az.business." + i + ".netassetsHistory.year"] = localStorage["az.business." + i + ".netassets"];
			}
		}
	}
}

function calculateDay()
{
	// Perform household actions
	for (var i=1;i<=parseInt(localStorage["az.householdCount"]);i++)
	{
		householdActions(i);
	}
	// Perform business actions
	for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
	{
		if (checkBusinessActiveStatus(i))
		{
			businessActions(i);
		}
	}

	// Perform bank actions
	bankActions();

	// Perform government actions
	govActions();	
}

function checkBusinessActiveStatus(id)
{
	if (localStorage["az.business." + id + ".ownerID"] == 0)
	{
		return false;
	}
	else {
		return true;
	}
}

function returnActiveBusinessesCount()
{
	var counter = 0;
	for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
	{
		if (localStorage["az.business." + i + ".ownerID"] > 0)
		{
			counter++;
		}
	}
	return counter;
}

function bankActions()
{
	var bankdepositrate_perday = parseFloat(localStorage["az.bankdepositrate"])/36000;
	var bankloanrate_perday = parseFloat(localStorage["az.bankloanrate"])/36000;
	
	// deposits earn <bankdepositrate>% per year interest => X/360 * X/100 = X/36000 per day
	// go through each household and business and accrude interest to their deposits
	for (var i=1;i<=parseInt(localStorage["az.householdCount"]);i++)
	{
		// check to see if they have deposited to the bank
		if (parseInt(localStorage["az.bank.depositsBank.household." + i]) > 0)
		{
			// add interest to deposit
			localStorage["az.bank.depositsBank.household." + i] = parseInt(localStorage["az.bank.depositsBank.household." + i]) + Math.round(parseInt(localStorage["az.bank.depositsBank.household." + i])*bankdepositrate_perday);
			// netassets increase by the interest
			localStorage["az.household." + i + ".netassets"] = parseInt(localStorage["az.household." + i + ".netassets"]) + Math.round(parseInt(localStorage["az.bank.depositsBank.household." + i])*bankdepositrate_perday);
			// banks assets decrease by the interest
			localStorage["az.bank.netassets"] = parseInt(localStorage["az.bank.netassets"]) - Math.round(parseInt(localStorage["az.bank.depositsBank.household." + i])*bankdepositrate_perday);
		}
	}

	// loans accrude interest <bankloanrate>% per year interest => X/360 * X/100 = X/36000 per day
	// go through each business and accrue interest to their loans
	for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
	{
		if (checkBusinessActiveStatus(i))
		{
			//var bankloan = parseFloat(localStorage["az.business." + i + ".bankloan"]);
			//localStorage["az.bank.curloansBank"] = (parseFloat(localStorage["az.bank.curloansBank"]) + (parseFloat(localStorage["az.bank.curloansBank"])/7200)).toPrecision(2);
			//localStorage["az.business." + i + ".bankloan"] = (parseFloat(localStorage["az.business." + i + ".bankloan"]) + (parseFloat(localStorage["az.bank.curloansBank"])/7200)).toPrecision(2);
			//localStorage["az.business." + i + ".cash"] = (parseFloat(localStorage["az.business." + i + ".cash"]) + (parseFloat(localStorage["az.bank.curloansBank"])/7200)).toPrecision(2);
			var bankloan = parseInt(localStorage["az.business." + i + ".bankloan"]);
			localStorage["az.bank.curloansBank"] = parseInt(localStorage["az.bank.curloansBank"]) + Math.round(parseInt(localStorage["az.bank.curloansBank"])*bankloanrate_perday);
			localStorage["az.business." + i + ".bankloan"] = parseInt(localStorage["az.business." + i + ".bankloan"]) + Math.round(parseInt(localStorage["az.bank.curloansBank"])*bankloanrate_perday);
			localStorage["az.business." + i + ".cash"] = parseInt(localStorage["az.business." + i + ".cash"]) + Math.round(parseInt(localStorage["az.bank.curloansBank"])*bankloanrate_perday);

			// banks assets increase by the interest
			localStorage["az.bank.netassets"] = parseInt(localStorage["az.bank.netassets"]) + Math.round(parseInt(localStorage["az.bank.curloansBank"])*bankloanrate_perday);
		}
	}
}

function govActions()
{	
	var govWorkersCount = parseInt(localStorage["az.gov.numemp"]);
	
	// pay its employees
	for (var i=1;i<=govWorkersCount;i++)
	{
		var empID = localStorage["az.gov.empID." + i];
		var minwagepay = parseInt(localStorage["az.minwagepay"]);
		
		// remove the funds from the gov
		localStorage["az.gov.netassets"] = parseInt(localStorage["az.gov.netassets"]) - minwagepay;
		localStorage["az.gov.cash"] = parseInt(localStorage["az.gov.cash"]) - minwagepay;

		var taxamount = Math.round(minwagepay*(parseInt(localStorage["az.incometax"])/minwagepay)); // tax amount
		
		// pay the funds
		localStorage["az.household." + empID + ".netassets"] = parseInt(localStorage["az.household." + empID + ".netassets"]) + minwagepay - taxamount; // flat rate of minwagepay a day
		localStorage["az.household." + empID + ".cash"] = parseInt(localStorage["az.household." + empID + ".cash"]) + minwagepay - taxamount; // flat rate of minwagepay a day
		localStorage["az.household." + empID + ".income"] = parseInt(localStorage["az.household." + empID + ".income"]) + minwagepay - taxamount; // flat rate of minwagepay a day
		
		// goverment tax
		localStorage["az.gov.netassets"] = parseInt(localStorage["az.gov.netassets"]) + taxamount;
		localStorage["az.gov.cash"] = parseInt(localStorage["az.gov.cash"]) + taxamount;
		localStorage["az.gov.taxcollected"] = parseInt(localStorage["az.gov.taxcollected"]) + taxamount;
	}
}

function householdActions(i)
{
	// 20% of households deposit a random chunk of their cash to the bank
	if (Math.random()>0.8)
	{
		var amount = Math.round(parseInt(localStorage["az.household." + i + ".cash"]) * Math.random() * Math.random());
		householdDepositCashToBank(i,amount);
	}

	// 20% of households withdraw a random chunk of their cash from the bank
	if (Math.random()>0.8)
	{
		var amount = Math.round(parseInt(localStorage["az.bank.depositsBank.household." + i]) * Math.random() * Math.random());
		householdWithdrawalCashFromBank(i,amount);
	}

	// If less then $1000 cash then get a loan
	if (parseInt(localStorage["az.household." + i + ".cash"]) < 1000)
	{
		// can household afford a 10K loan? - ie have 10K collateral?
		if (parseInt(localStorage["az.household." + i + ".netassets"]) >= 10000 && getAvailableLoanValue() >= 10000 )
		{
			getHouseholdLoan(i,10000);
		}
		else { // government assistance?
			// todo
		}
	}
	
	// 1% of households decide to start a business 
	if (Math.random()>0.99)
	{
		// check how many businesses are out there > 20% of population then dont start
		//if ((parseInt(localStorage["az.businessCount"]) * 5) < parseInt(localStorage["az.householdCount"])) // todo: get real count which dosent include inactive businesses
		
		var maxBusinesses = (parseInt(localStorage["az.maxBusinesses"])/100)*parseInt(localStorage["az.householdCount"]);
		
		//if ((returnActiveBusinessesCount() * 5) < parseInt(localStorage["az.householdCount"]))
		if (returnActiveBusinessesCount() < maxBusinesses)
		{
			if (parseInt(localStorage["az.household." + i + ".cash"])>=25000)
			{
				// remove the necessary cash from the new owner - starting the business eats up additional 5K
				localStorage["az.household." + i + ".cash"] = parseInt(localStorage["az.household." + i + ".cash"]) - 25000;
				localStorage["az.household." + i + ".netassets"] = parseInt(localStorage["az.household." + i + ".netassets"]) - 5000;
				createBusiness(i,20000);
			}
		}
	}
	
	// 20% of households decide to purchase something from businesses
	if (Math.random()>0.80 && parseInt(localStorage["az.businessCount"]) > 0)
	{
		//choose a random business
		var businessID = Math.floor((parseInt(localStorage["az.businessCount"]) * Math.random()) + 1); // fix this since it could be out of range
		
		var amount = 0;
		
		if (localStorage["az.business." + businessID + ".type"] == "manu") // manufacturing
		{
			// choose amount to spend
			if (parseInt(localStorage["az.household." + i + ".cash"]) > parseInt(localStorage["az.business." + businessID + ".inventory"]))
			{ // person has more cash then business inventory
				amount = Math.round(parseInt(localStorage["az.business." + businessID + ".inventory"]) * Math.random() * Math.random());
			}
			else { // person has less cash then business inventory
				amount = Math.round(parseInt(localStorage["az.household." + i + ".cash"]) * Math.random() * Math.random());
			}
			
			if (amount > 0)
			{
				//localStorage["az.business." + businessID + ".netassets"] = Math.round(parseInt(localStorage["az.business." + businessID + ".netassets"]) + amount);
				//var businessOwnerID = localStorage["az.business." + businessID + ".ownerID"];
				//localStorage["az.household." + businessOwnerID + ".netassets"] = Math.round(parseInt(localStorage["az.household." + businessOwnerID + ".netassets"]) + amount); // include the business owner
				
				var taxamount = Math.round(amount*(parseInt(localStorage["az.salestax"])/100)); // tax amount

				localStorage["az.household." + i + ".cash"] = Math.round(parseInt(localStorage["az.household." + i + ".cash"]) - amount - taxamount); // person uses the cash
				localStorage["az.household." + i + ".netassets"] = Math.round(parseInt(localStorage["az.household." + i + ".netassets"]) - (amount/2) - taxamount); // 50% of the transaction is kept in assets for household

				localStorage["az.business." + businessID + ".cash"] = Math.round(parseInt(localStorage["az.business." + businessID + ".cash"]) + amount); // business gets the cash
				localStorage["az.business." + businessID + ".income"] = Math.round(parseInt(localStorage["az.business." + businessID + ".income"]) + amount); // business gets the income
				localStorage["az.business." + businessID + ".inventory"] = Math.round(parseInt(localStorage["az.business." + businessID + ".inventory"]) - amount); // decrease the inventory

				//alert("household: " + i + " is buying from business: " + businessID + " of value " + amount);
		
				// goverment tax
				localStorage["az.gov.netassets"] = parseInt(localStorage["az.gov.netassets"]) + taxamount;
				localStorage["az.gov.cash"] = parseInt(localStorage["az.gov.cash"]) + taxamount;
				localStorage["az.gov.taxcollected"] = parseInt(localStorage["az.gov.taxcollected"]) + taxamount;
			}	
		}
		else { // service
			// choose amount to spend
			if (parseInt(localStorage["az.household." + i + ".cash"]) > parseInt(localStorage["az.business." + businessID + ".capacity"]))
			{ // person has more cash then business capacity
				amount = Math.round(parseInt(localStorage["az.business." + businessID + ".capacity"]) * Math.random() * Math.random());
			}
			else { // person has less cash then business capacity
				amount = Math.round(parseInt(localStorage["az.household." + i + ".cash"]) * Math.random() * Math.random());
			}
			
			if (amount > 0)
			{
				//localStorage["az.business." + businessID + ".netassets"] = Math.round(parseInt(localStorage["az.business." + businessID + ".netassets"]) + amount);
				//var businessOwnerID = localStorage["az.business." + businessID + ".ownerID"];
				//localStorage["az.household." + businessOwnerID + ".netassets"] = Math.round(parseInt(localStorage["az.household." + businessOwnerID + ".netassets"]) + amount); // include the business owner
				
				var taxamount = Math.round(amount*(parseInt(localStorage["az.salestax"])/100)); // tax amount
				
				localStorage["az.household." + i + ".cash"] = Math.round(parseInt(localStorage["az.household." + i + ".cash"]) - amount - taxamount); // person uses the cash
				localStorage["az.household." + i + ".netassets"] = Math.round(parseInt(localStorage["az.household." + i + ".netassets"]) - amount - taxamount); // household looses the cash assets

				localStorage["az.business." + businessID + ".cash"] = Math.round(parseInt(localStorage["az.business." + businessID + ".cash"]) + amount); // business gets the cash
				localStorage["az.business." + businessID + ".netassets"] = Math.round(parseInt(localStorage["az.business." + businessID + ".netassets"]) + amount); // business gets the cash
				localStorage["az.business." + businessID + ".income"] = Math.round(parseInt(localStorage["az.business." + businessID + ".income"]) + amount); // business gets the income
				localStorage["az.business." + businessID + ".capacity"] = Math.round(parseInt(localStorage["az.business." + businessID + ".capacity"]) - amount); // decrease the capacity
				
				var businessOwnerID = localStorage["az.business." + businessID + ".ownerID"];
				localStorage["az.household." + businessOwnerID + ".netassets"] = Math.round(parseInt(localStorage["az.household." + businessOwnerID + ".netassets"]) + amount); // include the business owner
				
				//alert("household: " + i + " is buying from business: " + businessID + " of value " + amount);
		
				// goverment tax
				localStorage["az.gov.netassets"] = parseInt(localStorage["az.gov.netassets"]) + taxamount;
				localStorage["az.gov.cash"] = parseInt(localStorage["az.gov.cash"]) + taxamount;
				localStorage["az.gov.taxcollected"] = parseInt(localStorage["az.gov.taxcollected"]) + taxamount;
			}
		}		
	}
	
	// 10% of households decide to find a business available job
	if (Math.random()>0.90 && parseInt(localStorage["az.businessCount"]) > 0)
	{
		if (getAvailForJob(i))
		{
			//choose a random business
			var businessID = Math.floor((parseInt(localStorage["az.businessCount"]) * Math.random()) + 1); // fix this since it could be out of range
			
			// 10% of businesses are going to hire and only if they have more then 10K cash
			if (Math.random()>0.90 && parseInt(localStorage["az.business." + businessID + ".cash"]) >= 10000)
			{
				var numEmplyees = parseInt(localStorage["az.business." + businessID + ".numemp"]) + 1;
				localStorage["az.business." + businessID + ".numemp"] = numEmplyees;
				localStorage["az.business." + businessID + ".empID." + numEmplyees] = i;
			}
		}
	}
	
	// 20% of households decide to find a government job
	if (Math.random()>0.80)
	{
		if (getAvailForJob(i))
		{
			// hire up to 10% of the households
			var govWorkersCount = parseInt(localStorage["az.gov.numemp"]);
			var householdCount = parseInt(localStorage["az.householdCount"]);
		
			var maxGovWorkers = (parseInt(localStorage["az.maxGovWorkers"])/100) * householdCount;
		
			//if (govWorkersCount*10 < householdCount)
			if (govWorkersCount < maxGovWorkers)
			{
				// there is space to hire, now lets check if we have the funds (30*100=3000 or one month of employment)
				//if (parseInt(localStorage["az.gov.cash"])>=3000)
				//{
					// household is available and government can hire so lets do it!
					govWorkersCount++;
					localStorage["az.gov.numemp"] = govWorkersCount;
					localStorage["az.gov.empID." + govWorkersCount] = i;
				//}
			}
		}
	}
	
}

// returns if this household is available for hire
function getAvailForJob(id)
{
	var numPeople = parseInt(localStorage["az.household." + id + ".numpeople"]);
	var numCurrentJobs = 0;
	
	// go through each business and check how many people from that household are employed
	for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
	{
		if (checkBusinessActiveStatus(i))
		{
			// go thorugh each employee including the owner
			for (var ii=1;ii<=parseInt(localStorage["az.business." + i + ".numemp"]);ii++)
			{
				if (localStorage["az.business." + i + ".empID." + ii] == id)
				{
					numCurrentJobs++;
				}
			}
		}
	}
	
	// go through each bank employee
	for (var i=1;i<=parseInt(localStorage["az.gov.numemp"]);i++)
	{
		if (localStorage["az.gov.empID." + i] == id)
		{
			numCurrentJobs++;
		}
	}
	
	// one person and no job so good to have job
	if (numPeople==1 && numCurrentJobs==0)
	{
		return true;
	}
	else {
		// max two jobs for two or more people
		if (numCurrentJobs<2)
		{
			return true;
		}
	}
		
	return false;
}

function businessActions(id)
{
	var numemployees = parseInt(localStorage["az.business." + id + ".numemp"]);
	
	// produce goods and services - update business values
	if (localStorage["az.business." + id + ".type"] == "manu") // manufacturing
	{
		// need min cash
		if (parseInt(localStorage["az.business." + id + ".cash"]) >= (500*numemployees))
		{
			localStorage["az.business." + id + ".inventory"] = parseInt(localStorage["az.business." + id + ".inventory"]) + (1000*numemployees); // $1000 worth of inventory a day of goods
			localStorage["az.business." + id + ".cash"] = parseInt(localStorage["az.business." + id + ".cash"]) - (500*numemployees); // takes $500 of cash to produce $1000 of inventory
			localStorage["az.business." + id + ".netassets"] = parseInt(localStorage["az.business." + id + ".netassets"]) + (500*numemployees); // Gain $500 per employee of assets
			
			var businessOwnerID = localStorage["az.business." + id + ".ownerID"];
			localStorage["az.household." + businessOwnerID + ".netassets"] = Math.round(parseInt(localStorage["az.household." + businessOwnerID + ".netassets"]) + (500*numemployees)); // include the business owner
		}
	}
	else { // service
		// need min cash
		if (parseInt(localStorage["az.business." + id + ".cash"]) >= (200*numemployees))
		{
			localStorage["az.business." + id + ".capacity"] = 2000*numemployees; // $2000 capacity a day for service per employee
			localStorage["az.business." + id + ".cash"] = parseInt(localStorage["az.business." + id + ".cash"]) - (200*numemployees); // takes $200 of cash a day to run the service per employee
			localStorage["az.business." + id + ".netassets"] = parseInt(localStorage["az.business." + id + ".netassets"]) - (200*numemployees); // Loose $200 per employee of assets

			var businessOwnerID = localStorage["az.business." + id + ".ownerID"];
			localStorage["az.household." + businessOwnerID + ".netassets"] = Math.round(parseInt(localStorage["az.household." + businessOwnerID + ".netassets"]) - (200*numemployees)); // include the business owner
		}
	}
	
	// pay the employees (including the owner)
	for (var i=1;i<=numemployees;i++)
	{
		var empID = localStorage["az.business." + id + ".empID." + i];
		var minwagepay = parseInt(localStorage["az.minwagepay"]);
		
		// remove the funds from the business
		localStorage["az.business." + id + ".netassets"] = parseInt(localStorage["az.business." + id + ".netassets"]) - minwagepay;
		localStorage["az.business." + id + ".cash"] = parseInt(localStorage["az.business." + id + ".cash"]) - minwagepay;

		var taxamount = Math.round(minwagepay*(parseInt(localStorage["az.incometax"])/100)); // tax amount
		
		// pay the funds
		localStorage["az.household." + empID + ".netassets"] = parseInt(localStorage["az.household." + empID + ".netassets"]) + minwagepay - taxamount; // flat rate of minwagepay a day
		localStorage["az.household." + empID + ".cash"] = parseInt(localStorage["az.household." + empID + ".cash"]) + minwagepay - taxamount; // flat rate of minwagepay a day
		localStorage["az.household." + empID + ".income"] = parseInt(localStorage["az.household." + empID + ".income"]) + minwagepay - taxamount; // flat rate of minwagepay a day
		
		// goverment tax
		localStorage["az.gov.netassets"] = parseInt(localStorage["az.gov.netassets"]) + taxamount;
		localStorage["az.gov.cash"] = parseInt(localStorage["az.gov.cash"]) + taxamount;
		localStorage["az.gov.taxcollected"] = parseInt(localStorage["az.gov.taxcollected"]) + taxamount;
	}
	
	// if business has negative cash then business gets a loan
	if (parseInt(localStorage["az.business." + id + ".cash"]) < 0)
	{
		// can business afford a 10K loan? - ie have 10K collateral?
		if (parseInt(localStorage["az.business." + id + ".netassets"]) >= 10000)
		{
			if (getAvailableLoanValue() >= 10000)
			{
				getBusinessLoan(id,10000);
			}
			else { // business has no cash but has assets but is not able to borrow - sells 10K of assets at major discount (50%)
				localStorage["az.business." + id + ".netassets"] = parseInt(localStorage["az.business." + id + ".netassets"]) - 5000;
				localStorage["az.business." + id + ".cash"] = parseInt(localStorage["az.business." + id + ".cash"]) + 5000;
				
				var businessOwnerID = localStorage["az.business." + id + ".ownerID"];
				localStorage["az.household." + businessOwnerID + ".netassets"] = Math.round(parseInt(localStorage["az.household." + businessOwnerID + ".netassets"]) - 5000); // include the business owner				
			}
		}
		else { // the business goes bust/bankrupt

			// layoff all employees
			// go thorugh each employee including the owner
			for (var i=1;i<=parseInt(localStorage["az.business." + id + ".numemp"]);i++)
			{
				localStorage.removeItem("az.business." + id + ".empID." + i);
			}
			localStorage["az.business." + id + ".numemp"] = 0;
			localStorage["az.business." + id + ".ownerID"] = 0; // the owner loses the business
		}
	}
	
	// if business has negative assets then goes bust/bankrupt
	if (parseInt(localStorage["az.business." + id + ".netassets"]) < 0)
	{
		// layoff all employees
		// go thorugh each employee including the owner
		for (var i=1;i<=parseInt(localStorage["az.business." + id + ".numemp"]);i++)
		{
			localStorage.removeItem("az.business." + id + ".empID." + i);
		}
		localStorage["az.business." + id + ".numemp"] = 0;
		localStorage["az.business." + id + ".ownerID"] = 0; // the owner loses the business
	}
}

// returns the amount that is available for loans by the bank
function getAvailableLoanValue()
{
	var totalBankDeposits = 0;
	for (var i=1;i<=parseInt(localStorage["az.householdCount"]);i++)
	{
		//totalBankDeposits += (parseFloat(localStorage["az.bank.depositsBank.household." + i])).toPrecision(2);
		if (parseInt(localStorage["az.bank.depositsBank.household." + i])>0)
		{
			totalBankDeposits += parseInt(localStorage["az.bank.depositsBank.household." + i]);
		}
	}
	for (var i=1;i<=parseInt(localStorage["az.businessCount"]);i++)
	{
		//totalBankDeposits += (parseFloat(localStorage["az.bank.depositsBank.business." + i])).toPrecision(2);
		if (parseInt(localStorage["az.bank.depositsBank.business." + i])>0)
		{
			totalBankDeposits += parseInt(localStorage["az.bank.depositsBank.business." + i]);
		}
	}

	var resultvalue = (totalBankDeposits*parseInt(localStorage["az.bankreservereq"]))-parseInt(localStorage["az.bank.curloansBank"]); // assuming <bankreservereq>:1 loan-reserve ratio
	
	//return ((totalBankDeposits*9)-parseFloat(localStorage["az.bank.curloansBank"])).toPrecision(2); // assuming <bankreservereq>:1 loan-reserve ratio
	return resultvalue;
}

function getHouseholdLoan(id,amount)
{
	//localStorage["az.bank.curloansBank"] = (parseFloat(localStorage["az.bank.curloansBank"]) + amount).toPrecision(2);
	//localStorage["az.household." + id + ".bankloan"] = (parseFloat(localStorage["az.household." + id + ".bankloan"]) + amount).toPrecision(2);
	//localStorage["az.household." + id + ".cash"] = (parseFloat(localStorage["az.household." + id + ".cash"]) + amount).toPrecision(2);
	localStorage["az.bank.curloansBank"] = parseInt(localStorage["az.bank.curloansBank"]) + amount;
	localStorage["az.household." + id + ".bankloan"] = parseInt(localStorage["az.household." + id + ".bankloan"]) + amount;
	localStorage["az.household." + id + ".cash"] = parseInt(localStorage["az.household." + id + ".cash"]) + amount;
}

function getBusinessLoan(id,amount)
{
	localStorage["az.bank.curloansBank"] = parseInt(localStorage["az.bank.curloansBank"]) + amount;
	localStorage["az.business." + id + ".bankloan"] = parseInt(localStorage["az.business." + id + ".bankloan"]) + amount;
	localStorage["az.business." + id + ".cash"] = parseInt(localStorage["az.business." + id + ".cash"]) + amount;
}

function createBusiness(i,investamt)
{
	var newBusinessID = parseInt(localStorage["az.businessCount"])+1;
	
	localStorage["az.business." + newBusinessID + ".netassets"] = investamt;
	localStorage["az.business." + newBusinessID + ".income"] = 0;
	localStorage["az.business." + newBusinessID + ".cash"] = investamt*0.5;
	
	localStorage["az.business." + newBusinessID + ".numemp"] = 1;
	localStorage["az.business." + newBusinessID + ".ownerID"] = i;
	localStorage["az.business." + newBusinessID + ".empID.1"] = i;
	
	localStorage["az.business." + newBusinessID + ".inventory"] = 0;
	localStorage["az.business." + newBusinessID + ".capacity"] = 0;

	localStorage["az.business." + newBusinessID + ".bankloan"] = 0;
	
	// decide if business is service or manufacturing 
	if (Math.random()>0.70)
	{
		localStorage["az.business." + newBusinessID + ".type"] = "manu";
	}
	else {
		localStorage["az.business." + newBusinessID + ".type"] = "serv";
	}
		
	localStorage["az.business." + newBusinessID + ".netassetsHistory.week"] = investamt;
	localStorage["az.business." + newBusinessID + ".netassetsHistory.month"] = investamt;
	localStorage["az.business." + newBusinessID + ".netassetsHistory.year"] = investamt;

	localStorage["az.businessCount"] = newBusinessID;
}

function householdDepositCashToBank(i,amount)
{
	localStorage["az.household." + i + ".cash"] = parseInt(localStorage["az.household." + i + ".cash"]) - amount;
	localStorage["az.bank.depositsBank.household." + i] = parseInt(localStorage["az.bank.depositsBank.household." + i]) + amount;
}

function householdWithdrawalCashFromBank(i,amount)
{
	localStorage["az.bank.depositsBank.household." + i] = parseInt(localStorage["az.bank.depositsBank.household." + i]) - amount;
	localStorage["az.household." + i + ".cash"] = parseInt(localStorage["az.household." + i + ".cash"]) + amount;
}

function redrawFrontEnd()
{
	window.location.reload();
}
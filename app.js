//BACKEND CALCULATION LOGIC MODULE
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
        this.percentage=Math.round((this.value/totalIncome)*100);
        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var budgetData = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    };

    var calculateTotal = function (type) {
        var sum = 0;
        budgetData.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        budgetData.totals[type] = sum;
    }



    return {
        addItem: function (type, des, val) {
            var newItem;
            var ID = 0;
            if (budgetData.allItems[type].length > 0) {
                ID = budgetData.allItems[type][budgetData.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            budgetData.allItems[type].push(newItem);
            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = budgetData.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                budgetData.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate actual budget: inc-exp
            budgetData.budget = budgetData.totals.inc - budgetData.totals.exp;

            //calculate % of expense.
            if (budgetData.totals.inc > 0) {
                budgetData.percentage = Math.round((budgetData.totals.exp / budgetData.totals.inc) * 100);
            } else {
                budgetData.percentage = -1;
            }
        },
        
        calculatePercentage: function(){
            
            budgetData.allItems.exp.forEach(function(cur){
                cur.calcPercentage(budgetData.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = budgetData.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {
            return {
                budget: budgetData.budget,
                totalInc: budgetData.totals.inc,
                totalExp: budgetData.totals.exp,
                percentage: budgetData.percentage
            }
        },

        testing: function () {
            console.log(budgetData);
        }
    };

})();

//FRONTEND DISPLAY LOGIC MODULE
var UIController = (function () {
    var DOMString = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDesc).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value),
            }
        },

        addListItem(obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMString.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMString.expenseContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%val%', obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem(selectorID) {
            var elm = document.getElementById(selectorID);
            elm.parentNode.removeChild(elm);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMString.inputDesc + ',' + DOMString.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (cur, idx, array) {
                cur.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMString.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMString.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMString.expenseLabel).textContent = obj.totalExp;
            document.querySelector(DOMString.percentageLabel).textContent = obj.percentage;

        },

        getDomString: function () {
            return DOMString;
        }
    }
})();

//INTERACTION BETWEEN FRONTEND AND BACKEND
var controller = (function (bgCtrl, uiCtrl) {
    //0. INITIALIZATION
    var setupEventListner = function () {
        var DOM = uiCtrl.getDomString();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {
        //1.Calculate Budget
        bgCtrl.calculateBudget();

        //2.Return Budget
        var budget = bgCtrl.getBudget();

        //3.Display Budget to UI
        uiCtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        //1. Calculate Percentage
        bgCtrl.calculatePercentage();
        //2.Read Percentage From Budget Controller
        var percecntages = bgCtrl.getPercentages();
        //3.Update UI with new Percentages.
        console.log(percecntages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        //1.Get Input Field Data
        input = uiCtrl.getInput();
       
        if (input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            //2.Add Item To Budget Controller
            newItem = bgCtrl.addItem(input.type, input.description, input.value);
            //3.Add Item to UI
            uiCtrl.addListItem(newItem, input.type);

            //4.Field Reseting
            uiCtrl.clearFields();

            //5.Calculate & Update Budget
            updateBudget();

            //6.Calculate and update Percentages.
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, type, ID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1.delete item from data structure
            bgCtrl.deleteItem(type, ID);

            //2.delete item from UI.
            uiCtrl.deleteListItem(itemID);

            //3.Update and display new budget
            updateBudget();

            //4.Calculate and update Percentages.
            updatePercentages();
        }
    }
    //7.IIFE's Returns
    return {
        init: function () {
            console.log('Application Started');
            setupEventListner();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);
controller.init();
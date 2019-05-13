//BACKEND CALCULATION LOGIC MODULE
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }


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
        budget:0,
        percentage: 0
        };
    
        var calculateTotal= function(type){
        var sum=0;
        budgetData.allItems[type].forEach(function(cur){
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

        calculateBudget: function(){
            //Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate actual budget: inc-exp
            budgetData.budget = budgetData.totals.inc - budgetData.totals.exp;  

            //calculate % of expense.
            if(budgetData.totals.inc > 0){
                budgetData.percentage = Math.round((budgetData.totals.exp / budgetData.totals.inc)*100);
            }else{
                budgetData.percentage = -1;
            }
        },

        getBudget: function(){
            return{
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
        expenseContainer: '.expenses__list'
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
            var html,newHtml,element;

            if (type === 'inc') {
                element=DOMString.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type==='exp'){
                element=DOMString.expenseContainer
                html='<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'            
            }
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description );
            newHtml = newHtml.replace('%val%',obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields=document.querySelectorAll(DOMString.inputDesc+ ',' +DOMString.inputValue);
            fieldsArr=Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(cur,idx,array){
                cur.value="";
            });
            fieldsArr[0].focus();
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
    };
    var updateBudget = function(){
        //1.Calculate Budget
        bgCtrl.calculateBudget();

        //2.Return Budget
        var budget = bgCtrl.getBudget();

        //3.Display Budget to UI
        console.log(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        //1.Get Input Field Data
        input = uiCtrl.getInput();
        console.log(input);

        if(input.description !== "" && !isNaN(input.value) && input.value !== 0 ){
        //2.Add Item To Budget Controller
        newItem = bgCtrl.addItem(input.type, input.description, input.value);
        //3.Add Item to UI
        uiCtrl.addListItem(newItem,input.type);

        //4.Field Reseting
        uiCtrl.clearFields();
        
        //5.Calculate & Update Budget
        updateBudget();
        }
        //7.IIFE's Returns
    }

    return {
        init: function () {
            console.log('Application Started');
            setupEventListner();
        }
    };

})(budgetController, UIController);
controller.init();
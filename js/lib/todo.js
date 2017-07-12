/*********************************************************************************
To Do Library
Exposes todo object which can be used to perform various operations on a todo list
todo.listItems is the model for this library that contains all the list items
currently available with their states.
**********************************************************************************/

(function(window) {
  'use strict';
  /* ********************************************************************
    function: Generates unique Id
    ********************************************************************
    return: string
  */
  function randomIdGenereator() {
    return "TD-" + Date.now();
  }

  /* ********************************************************************
    function: Instantiate the library
    ********************************************************************
    return: object
  */
  function defineToDo() {
    var todo = {};
    todo.listItems = {}; /* Model for the library. Contains currently available list itmes along with their states */

    /* @param: title of the list item
      ********************************************************************
      function: constructor function for list item objects
      ********************************************************************
    */
    function CreateItem(title) {
      this.title = title;
      this.done = false; /* property to track the current state (done or pending) of object */
      this.id = randomIdGenereator();
      while(this.id in todo.listItems) {
        this.id = randomIdGenereator();
      }
      this.creationDate = Date.now();
      todo.listItems[this.id] = this;
    }

    CreateItem["MAX_COUNT"] = 10;  /* Maximum number of list items allowed */

    /**************************************************************************
      private function: resets the matched word highlighting, if any, after the
      addition of item in the list
      *************************************************************************
    */
    function resetHighlighting() {
      var highlightedElem = Array.from(document.querySelectorAll(".hightlight-matches"));
      highlightedElem.map((elem) => {
        elem.removeAttribute("style");
      });
    }

    /* @param: tagname
      ********************************************************************
      function: returns the markup generated based on the received tagname
      ********************************************************************
      return: markup
    */
    CreateItem.prototype.getHTML = function(tagName) {
      var elem = document.createElement(tagName);
      var span = document.createElement("span");
      var textNode = document.createTextNode(this.title);
      span.appendChild(textNode);
      if(tagName == "TR") {
        var tdElem = document.createElement("td");
        tdElem.appendChild(span)
        elem.appendChild(tdElem);
      } else {
        elem.appendChild(span);
      }
      elem.setAttribute("data-key", this.id); /* attribute used for unique identification of list items */
      var dateSpan = document.createElement("span");
      var creationDate = new Date(this.creationDate);
      dateSpan.appendChild(document.createTextNode(`Created on: ${creationDate.toLocaleString()}`));
      dateSpan.style = `padding: .05em .6em;
                        font-size:62.5%;
                        border-radius:8px;
                        background: #EEF4C6;
                        color: #0E69A8;
                        position:absolute;
                        right:15%`;
      elem.appendChild(dateSpan);
      var iconElem = document.createElement("span");
      iconElem.setAttribute("data-icon", "delete-icon");
      iconElem.className = iconElem.getAttribute("data-icon");
      elem.appendChild(iconElem);
      return elem;
    };

    /* @param 1: nodelist/array of dom objects/single dom object - reference on which we need to bind the event
       @param 2: event which needs to be tied to the object
       @param 3: callback function
       @param 4: boolean representing bubbling/capturing phase
      ********************************************************************************************************
      function: Attaches events to the dom elements.
      ********************************************************************************************************
    */
    todo.on = function(context, events, callback, capture) {
      capture = (capture ? (("" + capture) === "true"  ? true : false) : false);
      if(context instanceof NodeList || Array.isArray(context)) {
        context = Array.from(context);
      }
      else {
        context = [context];
      }
      events = events.split(" ");
      events.map(function(event) {
        context.map(function(item){
          if(window.addEventListener) {
            item.addEventListener(event, callback, capture);
          } else if(window.attachEvent) {
            item.attachEvent("on" + event, callback);
          } else {
            item["on"+event] = callback;
          }
        });
      });
    };

    /* @param 1: string - string entered as title for the list item to be created
       @param 2: dom element - container of list items
      *******************************************************************************
      function: Adds list items to the container according to current sorting order
      *******************************************************************************
    */
    todo.addItem = function(inputFieldValue, container) {
      var item = new CreateItem(inputFieldValue);
      var tagName;

      /* Deciding the tag name based on the received container */
      if(container && container.lastElementChild) {
        tagName = container.lastElementChild.tagName;
      } else if(container.tagName.toUpperCase() === "UL") {
        tagName = "LI";
      } else if(container.tagName.toUpperCase() === "TABLE") {
        tagName = "TR";
      } else if(container.tagName.toUpperCase() === "TR") {
        tagName = "TD";
      } else {
        tagName = container.tagName;
      }

      var html = item.getHTML(tagName);
      resetHighlighting();
      if(this.getCount() == 1) {
        container.classList.add("ascending"); /* setting the default sort order */
      }
      if(container.classList.contains("ascending")) {
        container.appendChild(html);
      } else if(container.classList.contains("descending")) {
        container.insertBefore(html, container.firstElementChild);
      }
    };

    /* @param 1: dom object - dom element where event originated from
       @param 2: string - class name that needs to be toggled
      *****************************************************************
      function: toggles the state (done/pending) of list item
      *****************************************************************
    */
    todo.toggleItem = function(item, toggleClass) {
      toggleClass = toggleClass ? toggleClass : "done";
      while(!item.getAttribute("data-key")) {
        item = item.parentNode;
      }
      var id = item.getAttribute("data-key");
      var isDone = item.classList.contains(toggleClass);
      var listObj = this.listItems[id];
      listObj.done = !isDone;
      item.classList.toggle(toggleClass);
    };

    /* @param 1: nodelist/array of dom objects/single dom object - item to be delted
      ******************************************************************************
      function: deletes the list item(s)
      ******************************************************************************
    */
    todo.deleteItem = function(item) {
      if(item instanceof NodeList || Array.isArray(item)) {
        item = Array.from(item);
      }
      else {
        item = [item];
      }
      item.map(function(currItem) {
        currItem.parentNode.removeChild(currItem);
        var id = currItem.getAttribute("data-key");
        todo.listItems[id] = null; /* setting the object reference to null */
        delete todo.listItems[id]; /* removing deleted item from model */
      });
    };

    /* @param: string - value entered in the search box
      ********************************************************************************
      function: searches for the given string in the title of all available list items
      ********************************************************************************
    */
    todo.searchMatches = function(wordToMatch) {
      var listItemKeys = Object.keys(this.listItems);
      var listItemObjects = listItemKeys.map((key) => {
        return todo.listItems[key];
      });
      listItemObjects.map((curr) => {
        var regex = new RegExp(wordToMatch, "gi");
        var domElement = document.querySelector(`[data-key="${curr.id}"]`);
        var text = domElement.firstElementChild.textContent;
        text = text.replace(regex, `<span class="hightlight-matches" style="background:#ffc600;">${wordToMatch}</span>`)
        var temp = document.createElement("span");
        temp.innerHTML = text;
        domElement.replaceChild(temp, domElement.firstChild);
      });
    };

    /*****************************************************
      function: returns the count of available list items
      ****************************************************
      return: number
    */
    todo.getCount = function() {
      return Object.keys(this.listItems).length;
    };

    /***********************************************************************
      function: returns the max limit of items that can be added to the list
      **********************************************************************
      return: number
    */
    todo.getMaxCount = function() {
      return CreateItem["MAX_COUNT"];
    };

    /* @param: number
      **********************************************************************
      function: sets the max limit of items that can be added to the list
      **********************************************************************
    */
    todo.setMaxCount = function(value) {
      if(value && (typeof value === "number")) {
        value > todo.getCount() ? CreateItem["MAX_COUNT"] = value : console.error("Number of items already greater than passed value");
      } else {
        console.error("Unexpected value, expecting an integer");
      }
    };

    /* @param: string - title of list item
      ***************************************************************************
      function: Validates the length of the title of list item (excluding spaces)
      ***************************************************************************
      return: boolean
    */
    todo.validateTitleLength = (title) => title.split(" ").join("").length <= 120;

    /********************************
      function: resets the to do list
      *******************************
    */
    todo.resetList = function() {
      this.listItems = {};
      var classList = document.querySelector("[data-key]").parentNode.classList;
      classList.remove("descending");
      if(!classList.contains("ascending")) {
        classList.add("ascending");
      }
      document.querySelector("[data-key]").parentNode.innerHTML = "";
    };

    /*******************************************************
      function: sorts the to do list depending on sort order
      ******************************************************
    */
    todo.sortList = function() {
      var container = document.querySelector("[data-key]").parentNode;
      var listItems = Array.from(document.querySelectorAll("[data-key]"));
      var classList = container.classList;
      listItems.sort(function(a,b) {
        if(classList.contains("ascending")) {
          return +b.getAttribute("data-key").substring(3) - +a.getAttribute("data-key").substring(3);
        } else {
          return +a.getAttribute("data-key").substring(3) - +b.getAttribute("data-key").substring(3);
        }
      });
      if(classList.contains("ascending")) {
        classList.remove("ascending");
        classList.add("descending");
      } else {
        classList.remove("descending");
        classList.add("ascending");
      }
      container.innerHTML = "";
      listItems.map((item) => {
        container.appendChild(item);
      })
    };

    /* @param 1: nodelist/array of dom objects/single dom object - selected items
       @param 2: string - class name that needs to be added after marking items as done
      *********************************************************************************
      function: marks the selected items as done
      *********************************************************************************
    */
    todo.bulkDone = function(multipleSelections, doneClass) {
      doneClass = doneClass ? doneClass : "done";
      if(multipleSelections instanceof NodeList || Array.isArray(multipleSelections)) {
        multipleSelections = Array.from(multipleSelections);
      }
      else {
        multipleSelections = [multipleSelections];
      }
      multipleSelections.map(function(item) {
        var id = item.getAttribute("data-key");
        var listObj = todo.listItems[id];
        listObj.done = true;
        item.classList.add(doneClass);
      });
    };

    return todo;
  }

  if(window.todo === undefined) {
    /* instantiate the todo variable if it doesn't exist */
    window.todo = defineToDo();
  }
  else {
    /* todo variable already exists. Need to resolve the conflict */
    console.log("todo already exists!!! Change your implementation to resolve conflict");
  }
})(window);
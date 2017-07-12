/*******************************************************************************
App specific javascript that uses todo library methods and performs different
operations.
*******************************************************************************/

var myToDo = (function(){
  /* initialize all event bindings on dom load */
  function initializeHandlers() {
    addClickHandler();
    resetClickHandler();
    listItemsHandler();
    searchItemsHandler();
    sortItemsHandler();
    bulkOperationsHandler();
    bulkDeleteHandler();
    bulkDoneHandler();
  }

  /* event handlers start */
  function addClickHandler() {
    var addButton = document.querySelectorAll(".btn-add");
    todo.on(addButton, "click", addToDoItem, false);
  }

  function resetClickHandler() {
    var resetButton = document.querySelectorAll(".btn-reset");
    todo.on(resetButton, "click", resetList, false);
  }

  function listItemsHandler() {
    var container = document.querySelectorAll(".todo-list");
    todo.on(container, "click", handleListItem, false);
  }

  function searchItemsHandler() {
    var inputField = document.querySelectorAll(".input-item");
    todo.on(inputField, "change keyup", searchMatches, false);
  }

  function sortItemsHandler() {
    var sortButton = document.querySelectorAll(".btn-sort");
    todo.on(sortButton, "click", sortList, false);
  }

  function bulkOperationsHandler() {
    var container = document.querySelectorAll(".todo-list");
    todo.on(container, "contextmenu", selectMultipleItems, false);
  }

  function bulkDeleteHandler() {
    var bulkDeleteIcon = document.querySelectorAll(".delete-icon-bulk");
    todo.on(bulkDeleteIcon, "click", bulkDelete, false);
  }

  function bulkDoneHandler() {
    var bulkDoneIcon = document.querySelectorAll(".done-icon-bulk");
    todo.on(bulkDoneIcon, "click", bulkDone, false);
  }
  /* event handlers end */

  /* callbacks start */
  /* @param: event
    ********************************************************************
    function: adds an item to the todo list
    ********************************************************************
  */
  function addToDoItem(event) {
    var inputField = document.querySelector(".todo-header .input-item");
    var isDuplicate = isDuplicateListItem(inputField.value);

    if(inputField.value === "") {
      showMessage("Please enter some value");
      return false;
    } else if(todo.getCount() == todo.getMaxCount()) {
      showMessage(`List items cannot be more than ${todo.getMaxCount()}`);
      return false;
    }
    if(!todo.validateTitleLength(inputField.value)) {
      showMessage("Item title length cannot be more than 120 characters (excluding spaces)");
      return false;
    }

    if(isDuplicate) {
      showMessage("Item already exists");
      return false;
    }

    todo.addItem(inputField.value, document.querySelector(".todo-container .todo-list"));
    inputField.value = "";
    updateListItemCount();
    showSortButton();
  }

  /* ********************************************************************
    function: resets the todo list
    ********************************************************************
  */
  function resetList() {
    todo.resetList();
    updateListItemCount();
    showSortButton();
    updateSortButton();
    showBulkActionsIcons();
    document.querySelector(".todo-header .input-item").value = "";
  }

  /* @param: event
    ********************************************************************
    function: handles list item to decide toggle or delete operation
    ********************************************************************
  */
  function handleListItem(event) {
    event.target.classList.contains("delete-icon") ? deleteItem(event) : toggleItem(event);
  }

  /* @param: event
    ********************************************************************
    function: highlights the searched text
    ********************************************************************
  */
  function searchMatches(event) {
    todo.searchMatches(event.target.value);
  }

  /* ********************************************************************
    function: sorts the list and updates the sort button
    ********************************************************************
  */
  function sortList() {
    todo.sortList();
    updateSortButton();
  }

  /* @param: event
    ********************************************************************
    function: handles bulk operations like multiple delete/done
    ********************************************************************
  */
  function selectMultipleItems(event) {
    event.preventDefault();
    var item = event.target;
    while(!item.getAttribute("data-key"))  {
      item = item.parentNode;
    }
    item.classList.toggle("selected");
    showBulkActionsIcons();
  }

  /* @param: event
    ********************************************************************
    function: deletes all the selected list items
    ********************************************************************
  */
  function bulkDelete(event) {
    var multipleSelections = document.querySelectorAll("[data-key].selected");
    deleteItem(event, multipleSelections);
    showBulkActionsIcons();
  }

  /* @param: event
    ********************************************************************
    function: marks all the selected list items as done
    ********************************************************************
  */
  function bulkDone(event) {
    var multipleSelections = document.querySelectorAll("[data-key].selected");
    todo.bulkDone(multipleSelections, "done");
    multipleSelections = Array.from(multipleSelections);
    multipleSelections.map(function(item) {
      var span = document.createElement("span");
      span.setAttribute("data-icon", "done-icon");
      span.className = "done-icon";
      if(item.classList.contains("done")) {
        item.insertBefore(span, item.querySelector("[data-icon='delete-icon']"))
      }
    });
    clearMultipleSelection();
  }
  /* callbacks end */

  /* helper functions start */

  /* ********************************************************************
    function: updates the list item count
    ********************************************************************
  */
  function updateListItemCount() {
    document.querySelector(".counter").innerHTML = todo.getCount();
  }

  /* @param: event
    ********************************************************************
    function: toggles the list item and updates the styles,
    changing the icon
    ********************************************************************
  */
  function toggleItem(event) {
    todo.toggleItem(event.target, "done");
    var item = event.target;
    while(!item.getAttribute("data-key"))  {
      item = item.parentNode;
    }
    var span = document.createElement("span");
    span.setAttribute("data-icon", "done-icon");
    span.className = "done-icon";
    if(item.classList.contains("done")) {
      item.insertBefore(span, item.querySelector("[data-icon='delete-icon']"))
    } else {
      item.removeChild(item.querySelector("[data-icon='done-icon']"));
    }
    clearMultipleSelection();
  }

  /* @param 1: event
     @param 2: nodelist - selected items
    ********************************************************************
    function: deletes the item from the list
    ********************************************************************
  */
  function deleteItem(event, multipleSelections) {
    multipleSelections ? todo.deleteItem(multipleSelections) : todo.deleteItem(event.target.parentNode);
    updateListItemCount();
    showSortButton();
  }

  /* ********************************************************************
    function: changes the text of the sort button, based on sort order
    ********************************************************************
  */
  function updateSortButton() {
    var containerClassList = document.querySelector(".todo-list").classList;
    if(containerClassList.contains("ascending")) {
      document.querySelector(".sort-order").innerHTML = "Descending";
    } else if(containerClassList.contains("descending")){
      document.querySelector(".sort-order").innerHTML = "Ascending";
    }
  }

  /* @param: text
    ********************************************************************
    function: checks for duplicate list items
    ********************************************************************
    return boolean
  */
  function isDuplicateListItem(title) {
    var listItemKeys = Object.keys(todo.listItems);
    var isDuplicate = false;
    listItemKeys.forEach((key) => {
      if(todo.listItems[key].title === title) {
        isDuplicate = true;
        return;
      }
    });
    return isDuplicate;
  }

  /* ********************************************************************
    function: show sort button based on item count
    ********************************************************************
  */
  function showSortButton() {
    if(todo.getCount() > 1) {
      document.querySelector(".btn-sort").classList.remove("hidden");
    } else {
      document.querySelector(".btn-sort").classList.add("hidden");
    }
  }

  /* ********************************************************************
    function: show delte button based on multiple selection
    ********************************************************************
  */
  function showBulkActionsIcons() {
    var multipleSelections = document.querySelectorAll("[data-key].selected");
    if(multipleSelections.length) {
      document.querySelector(".delete-icon-bulk").classList.remove("hidden");
      document.querySelector(".done-icon-bulk").classList.remove("hidden");
    } else {
      document.querySelector(".delete-icon-bulk").classList.add("hidden");
      document.querySelector(".done-icon-bulk").classList.add("hidden");
    }
  }

  /* ********************************************************************
    function: clears multiple selection
    ********************************************************************
  */
  function clearMultipleSelection() {
    var multipleSelections = document.querySelectorAll("[data-key].selected");
    multipleSelections = Array.from(multipleSelections);
    multipleSelections.map((item) => {
      item.classList.remove("selected");
    });
    showBulkActionsIcons();
  }

  /* @param: text
    ********************************************************************
    function: displays error message
    ********************************************************************
  */
  function showMessage(msg) {
    var errorInfoDiv = document.querySelector(".error-info");
    errorInfoDiv.innerHTML = msg;
    errorInfoDiv.classList.add("show");
    setTimeout(() => {
      errorInfoDiv.classList.remove("show");
    },2000);
  }
  /* helper functions end */

  return {
    initializeHandlers : initializeHandlers  /* publicly exposed method */
  };
})();

document.addEventListener("DOMContentLoaded", myToDo.initializeHandlers);

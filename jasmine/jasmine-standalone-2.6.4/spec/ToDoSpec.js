describe("To Do", function() {
    it("should be globally available", function() {
        expect(todo).toBeDefined(); 
    });
    it("model should be available", function() {
        expect(todo.listItems).toBeDefined(); 
    });
  
    describe("when action has been performed", function() {
        var callback, result;
        var domElement = document.createElement("div");
        domElement.className = "sample-div";
    
        beforeEach(function() {
            callback = function(event) {
                result = event.type;
            };
        });

        it("should be able to bind click event to a single dom object", function() {
            todo.on(domElement, "click", callback, false);
            domElement.click();
            expect(result).toBe("click");
        });

        it("should be able to bind click event to multiple dom objects", function() {
            var domElement2 = document.createElement("div");
            domElement2.className = "sample-div";
            todo.on([domElement, domElement2], "click", callback, false);
            domElement.click();
            expect(result).toBe("click");
            domElement2.click();
            expect(result).toBe("click");
        });

        it("should be able to bind click event to a nodelist", function() {
            var domElement2 = document.createElement("div");
            domElement2.className = "sample-div2";
            document.body.appendChild(domElement2);
            var nodelistObj = document.querySelectorAll(".sample-div2");
            todo.on(nodelistObj, "click", callback, false);
            domElement2.click();
            expect(result).toBe("click");
        });
    });

    describe("when todo list based operations are performed", function() {
        var container = document.createElement("ul");
        container.className = "todo-list";
        
        it("items should be added to the list", function() {
            todo.addItem("First Item", container);
            expect(container.firstElementChild.tagName.toUpperCase()).toEqual("LI");
        });

        describe("when individual list item operations are performed", function() {
            var listItemKeys;

            beforeEach(function() {
               listItemKeys = Object.keys(todo.listItems); 
            });

            it("title of the list item should be equal to the input value", function() {
                var title = todo.listItems[listItemKeys[0]].title;
                expect(title).toEqual("First Item");
            });

            it("should be able to toggle item", function() {
                var item = container.firstElementChild;
                todo.toggleItem(item, "done");
                expect(todo.listItems[listItemKeys[0]].done).toEqual(true); 
            });

            it("should be able to delete item", function() {
                todo.addItem("Second Item", container);
                listItemKeys = Object.keys(todo.listItems);
                expect(listItemKeys.length).toEqual(2);
                var item = container.lastElementChild;
                todo.deleteItem(item);
                listItemKeys = Object.keys(todo.listItems);
                expect(listItemKeys.length).toEqual(1);
            });
        });

        it("should be able to return the count of list items", function() {
            var count = todo.getCount();
            expect(count).toEqual(1);
        });

        it("should be able to return the default maximum number of list items", function() {
            var count = todo.getMaxCount();
            expect(count).toEqual(10);
        });

        it("should be able to set the maximum number of list items to be added", function() {
            todo.setMaxCount(5);
            var count = todo.getMaxCount();
            expect(count).toEqual(5);
            todo.setMaxCount(10);
        });

        it("should be able to validate max length of the title of list item, 120 in current case", function() {
            var valid = todo.validateTitleLength("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
            expect(valid).toEqual(false);
        });

        it("should be able to validate max length of the title of list item, 120 in current case", function() {
            var valid = todo.validateTitleLength("Lorem ipsum dolor sit amet, consectetur adipiscing elit");
            expect(valid).toEqual(true);
        });

        it("should be able to reset list", function() {
            document.body.appendChild(container);
            todo.resetList();
            var listItemKeys = Object.keys(todo.listItems); 
            expect(listItemKeys.length).toEqual(0);
        });
    });  
 
});

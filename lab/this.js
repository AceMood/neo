
"use strict";

function Person () {
  [1,2,3].forEach(() => {
    debugger;
  });
}

Person.prototype.cal = function() {
  [1,2,3].forEach(() => {
    debugger;
  });

  [1,2,3].forEach(() => {
    debugger;
  });

  setTimeout(() => {
    debugger;
  }, 1000);
};

var p = new Person();
p.cal();
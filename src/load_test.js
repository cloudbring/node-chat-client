module.exports = function(options) {
  var student = null;
  var teacher = null;

  if(options.mode == "node")
  {
    if(!options.url) {
      options.url = 'http://localhost:3000';
    }

    student = require('./node/student')(options);
    teacher = require('./node/teacher')(options);
  }
  else {
    if(!options.url) {
      options.url = 'ws://localhost:4000/ws';
    }

    student = require('./elixir/student')(options);
    teacher = require('./elixir/teacher')(options);
  }

  for(var i = 1; i <= options.numTeachers; i++) {
    teacher.start(i, function() {
      process.exit();
    });
  }

  setTimeout(function() {
    doneCounter = 0;

    for(var i = options.idStart + 1; i <= options.idStart + options.numStudents; i++) {
      student.start(i, function() {
        doneCounter++;

        if(doneCounter == options.numStudents) {
          process.exit();
        }
      });
    }
  }, 100);
}

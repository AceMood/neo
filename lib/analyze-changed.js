/**
 * @file
 */

var AnalyzeChangedTask = require('./AnalyzeChangedTask');

var task;

process.on('message', function(m) {
  if (m.task) {
    task = AnalyzeChangedTask.fromObject(m.task);
  }
  if (m.paths) {
    task.run(m.paths, function(resources, skipped) {
      process.send({
        skipped: skipped,
        resources: resources.map(function(r) {
          return r.toObject();
        })
      });
    });
  }
  if (m.exit) {
    process.exit(0);
  }
});


function Plan() {
    var queue = [], state = 'idle', obj,
        run = function () {
            if(state === 'idle' && queue.length !== 0) {
                obj = queue.shift();
                state = 'request';
                obj.workflow.validate(obj.message);
            }
        },
        end = function() {
            if(state === 'request') return;
            state = 'idle';
            run();
        };
    return {
        plan: function (message, workflow, front) {
            if(front) {
                queue.unshift({message: message, workflow: workflow});
            } else {
                queue.push({message: message, workflow: workflow});
            }
            run();
        },
        success: function(data) {
            state = 'process';
            obj.workflow.execute(obj.message, data);
            end();
        },
        error: function(data) {
            state = 'process';
            if(!obj.workflow.ignore) {
                while(queue.length) {
                    queue.shift();
                }
            }
            obj.workflow.exception(obj.message, data);
            end();
        }
    }
}

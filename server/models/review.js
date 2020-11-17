var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Review = new Schema({
    //not required for passport authentication
    label: {
        type: String
    },
    username: {
        type: String
    },
    email: {
        type: String
    },
    review: {
        type: String
    },
    status : {
        type: String
    }
});

module.exports = mongoose.model('Review', Review);
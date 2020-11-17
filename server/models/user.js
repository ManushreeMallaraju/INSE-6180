var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema ({
    //not required for passport authentication
    username: {
        type: String,
        default: ''
    },
    admin: {
        type:Boolean,
        default: true
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
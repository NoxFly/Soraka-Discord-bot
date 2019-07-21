const admin = function(auth) {
        if(auth!='316639200462241792') {
            return false;
        }
        return true;
};

module.exports = admin;
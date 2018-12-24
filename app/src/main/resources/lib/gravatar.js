exports.hash = function (email) {
    var bean = __.newBean('com.enonic.app.simpleidprovider.GravatarHashHandler');
    bean.email = email;
    return bean.execute();
};
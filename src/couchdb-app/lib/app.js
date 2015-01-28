exports.views = {
    makes: {
        map: function (doc) {
            emit(doc.id, null);
        }
    }
};
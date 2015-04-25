(function($, matrixManager) {

matrixManager.registerPlugin({
	name: 'empty',
	displayName: 'Empty',
	lazyLoading: false,
	renderContent: function() {return '';}
});

})(jQuery, matrixManager);

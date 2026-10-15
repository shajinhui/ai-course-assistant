const { start, definedProjects, CommonProject } = OCS;

(function () {
	'use strict';

	// 运行脚本
	start({
		style: STYLE,
		projects: definedProjects(),
		defaultPanelName: CommonProject.scripts.ai.namespace,
		updatePage: 'https://github.com/shajinhui/ai-course-assistant/releases/latest'
	});





})();

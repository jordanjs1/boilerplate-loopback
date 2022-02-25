export default (Container) => {
	Container.disableRemoteMethod('destroyContainer', true);
	Container.disableRemoteMethod('getContainer', true);
	Container.disableRemoteMethod('getContainers', true);
	Container.disableRemoteMethod('removeFile', true);
	Container.disableRemoteMethod('createContainer', true);
	Container.disableRemoteMethod('destroyContainer', true);
	Container.disableRemoteMethod('getFiles', true);
	Container.disableRemoteMethod('getFile', true);
	Container.disableRemoteMethod('download', true);
};

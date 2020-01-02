function getNetWorkState(callBack) {
	wx.getNetworkType({
		success: (res) => {
			if (res.networkType == 'none') {
				if(typeof callBack === 'function') callBack(false);
			} else {
				if(typeof callBack === 'function') callBack(true);
			}
		}
	})
}

export default getNetWorkState
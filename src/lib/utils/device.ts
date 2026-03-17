const DEVICE_KEY = 'push_device_id';

export function getDeviceId(): string {
	if (typeof localStorage === 'undefined') return '';
	let id = localStorage.getItem(DEVICE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem(DEVICE_KEY, id);
	}
	return id;
}

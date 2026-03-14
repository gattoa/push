export interface ProgressPhoto {
	id: string;
	date: string;
	thumbnailUrl: string; // small base64 for grid/strip rendering
}

interface StoredPhoto {
	id: string;
	date: string;
	blob: Blob;
	thumbnailUrl: string;
}

const DB_NAME = 'push_photos';
const STORE_NAME = 'progress_photos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function resizeImage(file: File, maxSize: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			const canvas = document.createElement('canvas');
			let { width, height } = img;
			if (width > maxSize || height > maxSize) {
				if (width > height) {
					height = (height / width) * maxSize;
					width = maxSize;
				} else {
					width = (width / height) * maxSize;
					height = maxSize;
				}
			}
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			if (!ctx) { reject(new Error('No canvas context')); return; }
			ctx.drawImage(img, 0, 0, width, height);
			canvas.toBlob(
				(blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')),
				'image/jpeg',
				0.85
			);
		};
		img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
		img.src = url;
	});
}

function generateThumbnail(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			const canvas = document.createElement('canvas');
			const size = 200;
			let { width, height } = img;
			if (width > height) {
				height = (height / width) * size;
				width = size;
			} else {
				width = (width / height) * size;
				height = size;
			}
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			if (!ctx) { reject(new Error('No canvas context')); return; }
			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL('image/jpeg', 0.6));
		};
		img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
		img.src = url;
	});
}

export async function savePhoto(file: File): Promise<ProgressPhoto> {
	const [blob, thumbnailUrl] = await Promise.all([
		resizeImage(file, 800),
		generateThumbnail(file)
	]);

	const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const date = new Date().toISOString().split('T')[0];

	const stored: StoredPhoto = { id, date, blob, thumbnailUrl };

	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).put(stored);
		tx.oncomplete = () => resolve({ id, date, thumbnailUrl });
		tx.onerror = () => reject(tx.error);
	});
}

export async function getAllPhotos(): Promise<ProgressPhoto[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const request = tx.objectStore(STORE_NAME).getAll();
		request.onsuccess = () => {
			const photos: ProgressPhoto[] = (request.result as StoredPhoto[])
				.map(({ id, date, thumbnailUrl }) => ({ id, date, thumbnailUrl }))
				.sort((a, b) => b.date.localeCompare(a.date));
			resolve(photos);
		};
		request.onerror = () => reject(request.error);
	});
}

export async function getPhotoBlob(id: string): Promise<Blob | null> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const request = tx.objectStore(STORE_NAME).get(id);
		request.onsuccess = () => {
			const stored = request.result as StoredPhoto | undefined;
			resolve(stored?.blob ?? null);
		};
		request.onerror = () => reject(request.error);
	});
}

export async function deletePhoto(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

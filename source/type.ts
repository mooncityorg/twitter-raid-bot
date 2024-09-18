export interface Tweet {
	name: string;
	screenName: string;
	avatar: string;
	content: string;
	shortContent: string;
	createdAt: string;
	likes: number;
	retweets: number;
	replies: number;
	views: number;
}
export interface Retweet {
	status: number;
	datas: RetweetItem[];
}

export interface RetweetItem {
	username: string;
	id: string;
	created_at: string;
}

export interface ReplyItem {
	id: string;
	username: string;
	created_at: string;
}

export interface Reply {
	status: number;
	datas: ReplyItem[];
}

export interface Point {
	username: string;
	item: number; // 1: like, 2: retweet, 3: reply, 4: smash
}

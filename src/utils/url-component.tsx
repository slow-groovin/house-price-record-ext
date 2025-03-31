export const HouseDetailUrl = (hid: string) => {
	return <a href={`/options.html#/h/task/detail?id=${hid}`} target='_blank'
	          class='text-green-500 underline cursor-pointer hover:bg-gray-200 '>{hid}</a>
}

export const CommunityDetailUrl=(cid: string) => {
	return <a href={`/options.html#/c/task/detail?id=${cid}`} target='_blank' class='link'>{cid}</a>
}

export const CommunityRecordUrl = (id: string) => {
	return <a href={`/options.html#/c/record?id=${id}`} target='_blank'
	          class='link hover:text-amber-500  hover:bg-gray-200 '>{id}</a>
}

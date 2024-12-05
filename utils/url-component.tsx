export const HouseDetailUrl = (hid: string) => {
	return <a href={`/options.html#/h/task/detail?id=${hid}`} target='_blank'
	          class='text-green-500 underline cursor-pointer hover:bg-gray-200 '>{hid}</a>
}

export const CommunityRecordUrl = (id: string) => {
	return <a href={`/options.html#/c/record?id=${id}`} target='_blank'
	          class='text-blue-400 underline cursor-pointer hover:text-amber-500  hover:bg-gray-200 '>{id}</a>
}
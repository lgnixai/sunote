import { useState, useEffect } from 'react';
import {Combobox, Grid, Select, TextInput, useCombobox} from '@mantine/core';
import {useNoteStore} from "~/stores/note";
import {useInterfaceStore} from "~/stores/interface";
import {iconCombined, iconDataTable, iconLive, iconQuery} from "~/util/icons";
import {ListingItem} from "~/constants";

const groceries = ['Demo', 'study', 'golang', 'react', 'ok'];
const MYWS: ListingItem[] = [
	{ label: "Combined", value: "combined", icon: iconCombined },
	{ label: "Individual", value: "single", icon: iconQuery },
	{ label: "Table", value: "table", icon: iconDataTable },
	{ label: "Live", value: "live", icon: iconLive },
];
export default function WorkSpaceSelect() {
	// const {workSpace,setWorkSpace, editor,collection,provider } = useNoteStore.getState();
 	const setWorkSpace = useNoteStore((state) => state.setWorkSpace)
	const workSpace = useNoteStore((state) => state.workSpace)
	const combobox = useCombobox();
	const [value, setValue] = useState('');
	const shouldFilterOptions = !groceries.some((item) => item === value);
	const filteredOptions = shouldFilterOptions
		? groceries.filter((item) => item.toLowerCase().includes(value.toLowerCase().trim()))
		: groceries;

	const options = filteredOptions.map((item) => (
		<Combobox.Option value={item} key={item}>
			{item}
		</Combobox.Option>
	));
	useEffect(() => {
		 console.log(value)
		setWorkSpace(value)
	}, [value]);


	return (
		<>

			<Select
				label="切换空间"
				data={MYWS}
				value={workSpace}
				onChange={setWorkSpace as any}
			/>

		</>
	);
}


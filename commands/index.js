import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { render, Box, Text } from "ink";
import FuzzySelect from "ink-fuzzy-select";
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const openEditor = require("open-editor");

// Override prop types so React doesn't warn us
FuzzySelect.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({ label: PropTypes.string, value: PropTypes.any }),
		])
	).isRequired,
	prompt: PropTypes.string,
	limit: PropTypes.number,
	onSelect: PropTypes.func.isRequired,
};

async function rg(params) {
	const { stdout, stderr } = await exec(`rg ${params} --json`);

	return stdout
		.split("\n")
		.map((i) => {
			if (i === "") {
				return null;
			}
			return JSON.parse(i);
		})
		.filter((el) => el != null)
		.filter((el) => {
			return el.type == "match";
		});
}

const SearchQuery = ({ inputArgs }) => {
	const [query] = inputArgs;
	const [select, setSelect] = useState("");
	const [items, setItems] = useState();

	const getResults = async () => {
		const results = await rg(query);
		const items = results.map((r, index) => {
			return {
				...r,
				label: r.data.lines.text,
				value: r.data,
				key: index,
			};
		});
		setItems(items);
	};
	useEffect(() => {
		getResults();
	}, []);

	const onSelect = ({ path, line_number }) => {
		openEditor([
			{ file: path.text + ":" + line_number, line: line_number, column: 4 },
		]);
		setSelect(path.text);
	};
	return (
		<Box flexDirection="column">
			{items && <FuzzySelect options={items} onSelect={onSelect} />}
			<Text>{select}</Text>
		</Box>
	);
};

SearchQuery.propTypes = {
	inputArgs: PropTypes.array,
};

export default SearchQuery;

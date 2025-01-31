/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ControlType } from "../../constants/form-constants";
import logger from "./../../../../utils/logger";

function op() {
	return "isNotEmpty";
}
function evaluate(paramInfo, param2Info, value, controller) {
	const propertiesConfig = controller.getPropertiesConfig();
	const dataType = typeof paramInfo.value;
	switch (dataType) {
	case "undefined":
		return false;
	case "boolean":
		return true;
	case "string":
		return propertiesConfig.trimSpaces ? paramInfo.value.trim().length !== 0 : paramInfo.value.length !== 0;
	case "number":
		return paramInfo.value !== null;
	case "object":
		if (paramInfo.control.controlType === ControlType.DATEPICKERRANGE) {
			return paramInfo.value[0].trim() !== "" || paramInfo.value[1].trim() !== "";
		}
		return paramInfo.value === null ? false : paramInfo.value.length !== 0;
	default:
		logger.warn("Ignoring condition operation 'isNotEmpty' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
		return true;
	}
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };

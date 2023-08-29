import safeStringify from "https://esm.sh/json-stringify-safe";
import * as yaml from "https://esm.sh/js-yaml";

export const sanitizeAndRenderYaml = (object) => {
    const sanitizedObject = safeStringify(object);
    if (!sanitizedObject) return;
    const parsedObject = JSON.parse(sanitizedObject);
    return yaml.dump(parsedObject);
};

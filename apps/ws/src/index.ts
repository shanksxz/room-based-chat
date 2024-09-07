import { server } from "./socket";
import { getEnvVariable } from "./utils";

const PORT = getEnvVariable('PORT');

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

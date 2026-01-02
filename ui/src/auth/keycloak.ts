import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8089",
    realm: "local",
    clientId: "bingo",
});

export default keycloak;

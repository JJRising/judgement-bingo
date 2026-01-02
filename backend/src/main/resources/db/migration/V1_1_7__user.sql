CREATE TABLE app_user
(
    id                  UUID PRIMARY KEY,
    identity_provider   TEXT,
    external_subject_id TEXT,
    invite_name         TEXT        NOT NULL,
    email               TEXT        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL,
    disabled_at         TIMESTAMPTZ,

    UNIQUE (identity_provider, external_subject_id),
    UNIQUE (email)
);

ALTER TABLE player ADD COLUMN user_id UUID NOT NULL REFERENCES app_user (id);

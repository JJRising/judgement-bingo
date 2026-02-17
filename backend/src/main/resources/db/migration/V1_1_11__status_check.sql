-- Drop old constraint
ALTER TABLE prompt
    DROP CONSTRAINT prompt_status_check;

-- Add new constraint
ALTER TABLE prompt
    ADD CONSTRAINT prompt_status_check
        CHECK (
            status IN (
                       'SUBMITTED',
                       'ACCEPTED',
                       'COMPLETED',
                       'ACKNOWLEDGED'
                )
            );

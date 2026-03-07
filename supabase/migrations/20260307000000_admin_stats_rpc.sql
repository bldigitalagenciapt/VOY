-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
    total_users int;
    new_users_today int;
    new_users_week int;
    new_users_month int;
    total_documents int;
    uploads_today int;
    active_aima_processes int;
    suspended_users int;
BEGIN
    SELECT count(*) INTO total_users FROM profiles;
    
    SELECT count(*) INTO new_users_today 
    FROM profiles 
    WHERE created_at >= CURRENT_DATE;
    
    SELECT count(*) INTO new_users_week 
    FROM profiles 
    WHERE created_at >= (CURRENT_DATE - INTERVAL '7 days');
    
    SELECT count(*) INTO new_users_month 
    FROM profiles 
    WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days');
    
    SELECT count(*) INTO total_documents FROM documents;
    
    SELECT count(*) INTO uploads_today 
    FROM documents 
    WHERE created_at >= CURRENT_DATE;
    
    -- Check if aima_process table exists (it should based on useAimaProcess)
    -- If it doesn't, we can return 0
    BEGIN
        SELECT count(*) INTO active_aima_processes FROM aima_process;
    EXCEPTION WHEN undefined_table THEN
        active_aima_processes := 0;
    END;
    
    SELECT count(*) INTO suspended_users 
    FROM profiles 
    WHERE is_suspended = true;

    result := json_build_object(
        'total_users', total_users,
        'new_users_today', new_users_today,
        'new_users_week', new_users_week,
        'new_users_month', new_users_month,
        'total_documents', total_documents,
        'uploads_today', uploads_today,
        'active_aima_processes', active_aima_processes,
        'suspended_users', suspended_users
    );
    
    RETURN result;
END;
$$;

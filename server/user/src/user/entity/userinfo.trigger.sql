CREATE OR REPLACE FUNCTION create_userinfo()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.userinfo (follower, following, postcount, "userId")
    VALUES (0, 0, 0, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER userinfo_trigger
AFTER INSERT ON public."user"
FOR EACH ROW
EXECUTE FUNCTION create_userinfo();

#pgAdmin으로 직접 등록해야함..
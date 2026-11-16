import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../store/slices/authSlice.js';
import { fetchRolePermissions } from '../store/slices/roleAccessSlice.js';

const SessionBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const { isLoaded } = useSelector((state) => state.roleAccess || {});

  useEffect(() => {
    if (token) {
      if (!user) {
        dispatch(fetchMe());
      }
      if (!isLoaded) {
        dispatch(fetchRolePermissions(false));
      }
    }
  }, [dispatch, token, user, isLoaded]);

  return children;
};

export default SessionBootstrap;

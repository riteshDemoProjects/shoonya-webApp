"""Account endpoints: register, login, profile read/update, password change."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db
from ..security import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenOut, status_code=201)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    """Create an account and return a token, so registering also logs you in."""
    try:
        user = crud.create_user(db, payload)
    except crud.EmailTakenError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    return schemas.TokenOut(access_token=create_access_token(user.id), user=user)


@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate(db, payload)
    if user is None:
        # Deliberately vague: don't reveal whether the email exists.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    return schemas.TokenOut(access_token=create_access_token(user.id), user=user)


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return crud.update_user(db, current_user, payload)
    except crud.EmailTakenError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post("/change-password", response_model=schemas.TokenOut)
def change_password(
    payload: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change the password and re-issue a token.

    Changing a password invalidates every token issued before it, including the
    one used to make this call — so a fresh token comes back and the caller
    stays logged in here while other sessions are signed out.
    """
    try:
        user = crud.change_password(db, current_user, payload)
    except crud.PasswordError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return schemas.TokenOut(access_token=create_access_token(user.id), user=user)


@router.post("/reset-password")
def reset_password(payload: schemas.PasswordReset, db: Session = Depends(get_db)):
    """Development-only email reset until an email provider is configured."""
    if not security.IS_DEV_SECRET:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password reset is unavailable until email verification is configured.",
        )
    crud.reset_password(db, payload)
    return {"message": "If that account exists, its password has been reset."}

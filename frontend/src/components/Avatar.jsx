function Avatar({ user, size = "normal" }) {
  const name = user?.username || "U";
  const image = user?.profileImage || "";

  if (image) {
    return (
      <img
        className={`avatar-img ${size}`}
        src={image}
        alt={name}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return <div className={`avatar ${size}`}>{name.charAt(0).toUpperCase()}</div>;
}

export default Avatar;